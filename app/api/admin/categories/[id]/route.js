import connectMongo from "@/configs/connectDB";
import Category from "@/models/Category";
import Course from "@/models/Course";
import { isAdmin } from "@/utils/auth";
import { isValidId, validateCategory } from "@/utils/adminValidation";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  const { id } = await params;
  if (!isValidId(id))
    return NextResponse.json(
      { success: false, message: "شناسه دسته‌بندی معتبر نیست" },
      { status: 400 },
    );
  try {
    const { value, error } = validateCategory(await req.json());
    if (error)
      return NextResponse.json(
        { success: false, message: error },
        { status: 400 },
      );
    await connectMongo();
    const category = await Category.findByIdAndUpdate(
      id,
      { $set: value },
      { returnDocument: "after", runValidators: true },
    );
    if (!category)
      return NextResponse.json(
        { success: false, message: "دسته‌بندی یافت نشد" },
        { status: 404 },
      );
    return NextResponse.json({
      success: true,
      category,
      message: "دسته‌بندی با موفقیت ویرایش شد",
    });
  } catch (error) {
    const status =
      error.code === 11000 ? 409 : error instanceof SyntaxError ? 400 : 500;
    const message =
      status === 409
        ? "این آدرس قبلاً برای یک دسته‌بندی استفاده شده است"
        : status === 400
          ? "اطلاعات ارسالی معتبر نیست"
          : "خطا در ویرایش دسته‌بندی";
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function DELETE(req, { params }) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  const { id } = await params;
  if (!isValidId(id))
    return NextResponse.json(
      { success: false, message: "شناسه دسته‌بندی معتبر نیست" },
      { status: 400 },
    );
  try {
    await connectMongo();
    if (await Course.exists({ category: id })) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ابتدا دسته‌بندی دوره‌های مرتبط را تغییر دهید، سپس دسته‌بندی را حذف کنید",
        },
        { status: 409 },
      );
    }
    const category = await Category.findByIdAndDelete(id);
    if (!category)
      return NextResponse.json(
        { success: false, message: "دسته‌بندی یافت نشد" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, message: "دسته‌بندی حذف شد" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در حذف دسته‌بندی" },
      { status: 500 },
    );
  }
}
