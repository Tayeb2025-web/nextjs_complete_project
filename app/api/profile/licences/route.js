import connectMongo from "@/configs/connectDB";
import Licence from "@/models/Licence";
import { getCurrentUser } from "@/utils/auth";
import { getUserCourses } from "@/utils/userCourses";
import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = getCurrentUser(req);
  if (!auth.success) return auth;
  try {
    await connectMongo();
    const library = await getUserCourses(auth.userId);
    if (!library)
      return NextResponse.json(
        { success: false, message: "حساب کاربری یافت نشد" },
        { status: 404 },
      );
    const licences = await Licence.find({
      user: auth.userId,
      course: { $in: library.courses.map((course) => course._id) },
    }).lean();
    const byCourse = new Map(
      licences.map((licence) => [String(licence.course), licence]),
    );
    return NextResponse.json(
      {
        success: true,
        courses: library.courses.map((course) => {
          const licence = byCourse.get(String(course._id));
          return {
            ...course,
            licence: licence
              ? {
                  _id: licence._id,
                  isActive: licence.isActive,
                  updatedAt: licence.updatedAt,
                  ...(licence.isActive
                    ? { key: licence.key, downloadUrl: licence.downloadUrl }
                    : {}),
                }
              : null,
          };
        }),
        unavailableCount: library.unavailableCount,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت لایسنس‌ها" },
      { status: 500 },
    );
  }
}
