import connectMongo from "@/configs/connectDB";
import Category from "@/models/Category";
import Course from "@/models/Course";
import { isAdmin } from "@/utils/auth";
import { validateCategory } from "@/utils/adminValidation";
import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  try {
    await connectMongo();
    const [categories, counts] = await Promise.all([
      Category.find().sort({ createdAt: -1 }).lean(),
      Course.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    ]);
    const courseCounts = new Map(
      counts.map((item) => [String(item._id), item.count]),
    );
    return NextResponse.json({
      success: true,
      categories: categories.map((category) => ({
        ...category,
        coursesCount: courseCounts.get(String(category._id)) || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت دسته‌بندی‌ها" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  try {
    const { value, error } = validateCategory(await req.json());
    if (error)
      return NextResponse.json(
        { success: false, message: error },
        { status: 400 },
      );
    await connectMongo();
    const category = await Category.create(value);
    return NextResponse.json(
      { success: true, category, message: "دسته‌بندی با موفقیت اضافه شد" },
      { status: 201 },
    );
  } catch (error) {
    const status =
      error.code === 11000 ? 409 : error instanceof SyntaxError ? 400 : 500;
    const message =
      status === 409
        ? "این آدرس قبلاً برای یک دسته‌بندی استفاده شده است"
        : status === 400
          ? "اطلاعات ارسالی معتبر نیست"
          : "خطا در ذخیره دسته‌بندی";
    return NextResponse.json({ success: false, message }, { status });
  }
}
