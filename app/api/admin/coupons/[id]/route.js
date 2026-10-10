import connectMongo from "@/configs/connectDB";
import Coupon from "@/models/Coupon";
import { isAdmin } from "@/utils/auth";
import { isValidId } from "@/utils/adminValidation";
import { validateCoupon } from "@/utils/coupon";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  const { id } = await params;
  if (!isValidId(id))
    return NextResponse.json(
      { success: false, message: "شناسه معتبر نیست" },
      { status: 400 },
    );
  try {
    const { value, error } = validateCoupon(await req.json());
    if (error)
      return NextResponse.json(
        { success: false, message: error },
        { status: 400 },
      );
    await connectMongo();
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { $set: value },
      { returnDocument: "after", runValidators: true },
    );
    if (!coupon)
      return NextResponse.json(
        { success: false, message: "کد تخفیف یافت نشد" },
        { status: 404 },
      );
    return NextResponse.json({
      success: true,
      coupon,
      message: "کد تخفیف ویرایش شد",
    });
  } catch (error) {
    const status =
      error.code === 11000 ? 409 : error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        message:
          status === 409
            ? "این کد قبلاً ثبت شده است"
            : status === 400
              ? "اطلاعات ارسالی معتبر نیست"
              : "خطا در ویرایش کد تخفیف",
      },
      { status },
    );
  }
}

export async function DELETE(req, { params }) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  const { id } = await params;
  if (!isValidId(id))
    return NextResponse.json(
      { success: false, message: "شناسه معتبر نیست" },
      { status: 400 },
    );
  try {
    await connectMongo();
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon)
      return NextResponse.json(
        { success: false, message: "کد تخفیف یافت نشد" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, message: "کد تخفیف حذف شد" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در حذف کد تخفیف" },
      { status: 500 },
    );
  }
}
