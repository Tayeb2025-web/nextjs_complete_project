// app/api/orders/route.js

import { NextResponse } from "next/server";
import Order from "@/models/Order";
import { getCurrentUser } from "@/utils/auth";
import connectMongo from "@/configs/connectDB";
import { getOrderQuote } from "@/utils/orderPricing";

export async function POST(req) {
  try {
    // اعتبارسنجی توکن
    const user = getCurrentUser(req);

    if (!user.success) {
      return NextResponse.json(
        { success: false, message: "Unathuorized" },
        { status: 401 },
      );
    }

    const data = await req.json();
    await connectMongo();
    const quote = await getOrderQuote(data?.courseIds, data?.couponCode);
    if (quote.error)
      return NextResponse.json(
        { success: false, message: quote.error },
        { status: quote.status },
      );
    if (
      data.expectedTotal !== undefined &&
      data.expectedTotal !== quote.totalPrice
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "مبلغ سبد خرید تغییر کرده است؛ مبلغ تازه را بررسی و دوباره خرید را تکمیل کنید",
        },
        { status: 409 },
      );
    }

    // ایجاد سفارش
    const order = await Order.create({
      user: user.userId,
      items: quote.items,
      subtotal: quote.subtotal,
      discountAmount: quote.discountAmount,
      totalPrice: quote.totalPrice,
      coupon: quote.coupon,
      couponCode: quote.couponCode,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully.",
        orderId: order._id,
        totalPrice: order.totalPrice,
      },
      { status: 201 },
    );
  } catch (err) {
    console.log(err.message);

    return NextResponse.json(
      {
        success: false,
        message:
          err instanceof SyntaxError
            ? "اطلاعات ارسالی معتبر نیست"
            : "خطا در ثبت سفارش",
      },
      { status: err instanceof SyntaxError ? 400 : 500 },
    );
  }
}
