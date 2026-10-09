import connectMongo from "@/configs/connectDB";
import Licence from "@/models/Licence";
import User from "@/models/User";
import Course from "@/models/Course";
import { isAdmin } from "@/utils/auth";
import { isValidId } from "@/utils/adminValidation";
import { getUserCourseAccess } from "@/utils/userCourses";
import { NextResponse } from "next/server";

const privateHeaders = { "Cache-Control": "private, no-store" };
const reply = (data, status = 200) =>
  NextResponse.json(data, { status, headers: privateHeaders });

export async function GET(req) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!isValidId(courseId))
    return reply({ success: false, message: "شناسه دوره معتبر نیست" }, 400);
  const requestedPage = Number(req.nextUrl.searchParams.get("page"));
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, 100000)
      : 1;
  try {
    await connectMongo();
    if (!(await Course.exists({ _id: courseId })))
      return reply({ success: false, message: "دوره یافت نشد" }, 404);
    const [licences, total] = await Promise.all([
      Licence.find({ course: courseId })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * 10)
        .limit(10)
        .lean(),
      Licence.countDocuments({ course: courseId }),
    ]);
    return reply({
      success: true,
      licences,
      totalPages: Math.max(1, Math.ceil(total / 10)),
    });
  } catch {
    return reply({ success: false, message: "خطا در دریافت لایسنس‌ها" }, 500);
  }
}

export async function PUT(req) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body))
      return reply(
        { success: false, message: "اطلاعات ارسالی معتبر نیست" },
        400,
      );
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const key = typeof body.key === "string" ? body.key.trim() : "";
    const downloadUrl =
      typeof body.downloadUrl === "string" ? body.downloadUrl.trim() : "";
    if (
      !isValidId(body.courseId) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      key.length < 16 ||
      key.length > 20000 ||
      /\s/.test(key) ||
      typeof body.isActive !== "boolean"
    ) {
      return reply(
        {
          success: false,
          message: "ایمیل، کلید لایسنس یا اطلاعات دوره معتبر نیست",
        },
        400,
      );
    }
    if (downloadUrl) {
      let url;
      try {
        url = new URL(downloadUrl);
      } catch {
        return reply(
          { success: false, message: "لینک دانلود معتبر نیست" },
          400,
        );
      }
      if (
        downloadUrl.length > 2048 ||
        url.protocol !== "https:" ||
        url.hostname !== "dl.spotplayer.ir" ||
        url.username ||
        url.password ||
        url.port
      )
        return reply(
          {
            success: false,
            message: "لینک دانلود باید از https://dl.spotplayer.ir باشد",
          },
          400,
        );
    }
    await connectMongo();
    const [user, course] = await Promise.all([
      User.findOne({ email }).select("_id").lean(),
      Course.findById(body.courseId).select("_id").lean(),
    ]);
    if (!user || !course)
      return reply(
        {
          success: false,
          message: !user ? "کاربری با این ایمیل یافت نشد" : "دوره یافت نشد",
        },
        404,
      );
    const access = await getUserCourseAccess(user._id);
    if (!access.courseIds.includes(body.courseId))
      return reply(
        {
          success: false,
          message:
            "این دوره در حساب کاربر ثبت نشده است؛ لایسنس فقط برای صاحب دوره قابل ثبت است",
        },
        403,
      );
    await Licence.findOneAndUpdate(
      { user: user._id, course: course._id },
      {
        $set: { key, downloadUrl, isActive: body.isActive },
        $setOnInsert: { createdBy: auth.adminId },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
    return reply({ success: true, message: "لایسنس کاربر ذخیره شد" });
  } catch (error) {
    const status =
      error.code === 11000 ? 409 : error instanceof SyntaxError ? 400 : 500;
    return reply(
      {
        success: false,
        message:
          status === 409
            ? "این کلید قبلاً برای یک لایسنس ثبت شده است"
            : status === 400
              ? "اطلاعات ارسالی معتبر نیست"
              : "خطا در ذخیره لایسنس",
      },
      status,
    );
  }
}
