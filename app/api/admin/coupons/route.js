import connectMongo from "@/configs/connectDB";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";
import { isAdmin } from "@/utils/auth";
import { validateCoupon } from "@/utils/coupon";
import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  try {
    await connectMongo();
    const [coupons, uses] = await Promise.all([
      Coupon.find().sort({ createdAt: -1 }).lean(),
      Order.aggregate([
        { $match: { status: "paid", coupon: { $ne: null } } },
        { $group: { _id: "$coupon", count: { $sum: 1 } } },
      ]),
    ]);
    const counts = new Map(uses.map((item) => [String(item._id), item.count]));
    return NextResponse.json({
      success: true,
      coupons: coupons.map((coupon) => ({
        ...coupon,
        usedCount: counts.get(String(coupon._id)) || 0,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت کدهای تخفیف" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  try {
    const { value, error } = validateCoupon(await req.json());
    if (error)
      return NextResponse.json(
        { success: false, message: error },
        { status: 400 },
      );
    await connectMongo();
    const coupon = await Coupon.create(value);
    return NextResponse.json(
      { success: true, coupon, message: "کد تخفیف اضافه شد" },
      { status: 201 },
    );
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
              : "خطا در ذخیره کد تخفیف",
      },
      { status },
    );
  }
}
