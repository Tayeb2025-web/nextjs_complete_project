import connectMongo from "@/configs/connectDB";
import Course from "@/models/Course";
import { isAdmin } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  try {
    await connectMongo();
    const courses = await Course.find({
      isFree: { $ne: true },
      price: { $gt: 0 },
    })
      .select("title slug price discountPrice status thumbnail")
      .sort({ updatedAt: -1 })
      .lean();
    return NextResponse.json({ success: true, courses });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت تخفیف‌ها" },
      { status: 500 },
    );
  }
}
