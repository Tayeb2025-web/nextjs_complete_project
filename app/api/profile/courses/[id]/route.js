import connectMongo from "@/configs/connectDB";
import Course from "@/models/Course";
import { getCurrentUser } from "@/utils/auth";
import { isValidId } from "@/utils/adminValidation";
import { getUserCourseAccess } from "@/utils/userCourses";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const auth = getCurrentUser(req);
  if (!auth.success) return auth;
  const { id } = await params;
  if (!isValidId(id))
    return NextResponse.json(
      { success: false, message: "شناسه دوره معتبر نیست" },
      { status: 400 },
    );
  try {
    await connectMongo();
    const access = await getUserCourseAccess(auth.userId);
    if (!access)
      return NextResponse.json(
        { success: false, message: "حساب کاربری یافت نشد" },
        { status: 404 },
      );
    if (!access.courseIds.includes(id))
      return NextResponse.json(
        { success: false, message: "این دوره در حساب شما ثبت نشده است" },
        { status: 403 },
      );
    const course = await Course.findOne({ _id: id, status: "published" })
      .select("title chapters lessonsCount isFree price")
      .lean();
    if (!course)
      return NextResponse.json(
        { success: false, message: "محتوای این دوره فعلاً در دسترس نیست" },
        { status: 404 },
      );
    return NextResponse.json(
      { success: true, course },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت جلسات دوره" },
      { status: 500 },
    );
  }
}
