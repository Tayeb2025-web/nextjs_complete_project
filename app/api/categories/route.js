import connectMongo from "@/configs/connectDB";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongo();
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select("name slug")
      .lean();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت دسته‌بندی‌ها" },
      { status: 500 },
    );
  }
}
