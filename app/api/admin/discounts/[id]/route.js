import connectMongo from "@/configs/connectDB";
import Course from "@/models/Course";
import { isAdmin } from "@/utils/auth";
import { isValidId } from "@/utils/adminValidation";
import { validateCoursePricing } from "@/utils/coursePrice";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  const { id } = await params;
  if (!isValidId(id))
    return NextResponse.json(
      { success: false, message: "شناسه دوره معتبر نیست" },
      { status: 400 },
    );
  try {
    const data = await req.json();
    if (
      !data ||
      !Object.hasOwn(data, "discountPrice") ||
      (data.discountPrice !== null && typeof data.discountPrice !== "number")
    ) {
      return NextResponse.json(
        { success: false, message: "قیمت تخفیف‌خورده معتبر نیست" },
        { status: 400 },
      );
    }
    await connectMongo();
    const course = await Course.findById(id);
    if (!course)
      return NextResponse.json(
        { success: false, message: "دوره یافت نشد" },
        { status: 404 },
      );
    if (course.isFree || course.price <= 0)
      return NextResponse.json(
        { success: false, message: "دوره رایگان نیازی به تخفیف ندارد" },
        { status: 400 },
      );
    const pricing = validateCoursePricing({
      price: course.price,
      discountPrice: data.discountPrice,
    });
    if (pricing.error)
      return NextResponse.json(
        { success: false, message: pricing.error },
        { status: 400 },
      );
    const updated = await Course.findOneAndUpdate(
      { _id: id, price: course.price, isFree: { $ne: true } },
      { $set: { discountPrice: pricing.discountPrice } },
      { returnDocument: "after", runValidators: true },
    ).select("title slug price discountPrice status thumbnail");
    if (!updated)
      return NextResponse.json(
        {
          success: false,
          message: "قیمت دوره تغییر کرده است؛ صفحه را تازه کنید",
        },
        { status: 409 },
      );
    return NextResponse.json({
      success: true,
      course: updated,
      message:
        data.discountPrice === null
          ? "تخفیف حذف شد"
          : "تخفیف با موفقیت ذخیره شد",
    });
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        message:
          status === 400 ? "اطلاعات ارسالی معتبر نیست" : "خطا در ذخیره تخفیف",
      },
      { status },
    );
  }
}
