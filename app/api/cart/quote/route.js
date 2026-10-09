import connectMongo from "@/configs/connectDB";
import { getOrderQuote } from "@/utils/orderPricing";
import { getCurrentUser } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const auth = getCurrentUser(req);
  if (!auth.success) return auth;
  try {
    const data = await req.json();
    await connectMongo();
    const quote = await getOrderQuote(data?.courseIds, data?.couponCode);
    if (quote.error)
      return NextResponse.json(
        { success: false, message: quote.error },
        { status: quote.status },
      );
    return NextResponse.json({
      success: true,
      subtotal: quote.subtotal,
      discountAmount: quote.discountAmount,
      totalPrice: quote.totalPrice,
      couponCode: quote.couponCode,
      items: quote.items,
    });
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        message:
          status === 400
            ? "اطلاعات ارسالی معتبر نیست"
            : "خطا در محاسبه مبلغ سبد خرید",
      },
      { status },
    );
  }
}
