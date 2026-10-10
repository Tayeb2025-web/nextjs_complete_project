import connectMongo from "@/configs/connectDB";
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
    return NextResponse.json(
      { success: true, ...library },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Error fetching user courses:", error.message);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت دوره‌های شما" },
      { status: 500 },
    );
  }
}
