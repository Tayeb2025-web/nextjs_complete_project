// app/api/payment/verify/route.js

import { NextResponse } from "next/server";
import Order from "@/models/Order";
import User from "@/models/User";
import connectMongo from "@/configs/connectDB";

export async function POST(req) {
  try {
    await connectMongo();

    const { authority , status } = await req.json();

    if (!authority || !status) {
      return NextResponse.json(
        { success: false, message: "آتوریتی و استتوس ضروری هست" },
        { status: 400 },
      );
    }

    const order = await Order.findOne({ authority });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "سفارش یافت نشد" },
        { status: 404 },
      );
    }

    // اگر قبلاً پرداخت شده باشد
    if (order.status === "paid") {
      return NextResponse.json({
        success: true,
        message: "پرداخت قبلا تایید شده",
      });
    }

    // کاربر پرداخت را لغو کرده
    if (status !== "OK") {
      order.status = "failed";
      await order.save();
      return NextResponse.json({ success: false, message: "پرداخت لفو شد" });
    }

    // Verify Request
    const response = await fetch(
      "https://sandbox.zarinpal.com/pg/v4/payment/verify.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          merchant_id: process.env.ZARINPAL_MERCHANT_ID,
          amount: order.totalPrice,
          authority: authority,
        }),
      },
    );

    const result = await response.json();

    if (result.data.code !== 100 && result.data.code !== 101) {
      order.status = "failed";

      await order.save();

      return NextResponse.json(
        { success: false, message: "تایید پرداخت ناموفق بود" },
        { status: 400 },
      );
    }

    // سفارش پرداخت شد
    order.status = "paid";
    order.refId = String(result.data.ref_id);
    order.paidAt = new Date();

    await order.save();

    // اضافه کردن دوره‌ها به کاربر
    const user = await User.findById(order.user);
    const purchasedCourses = order.items.map((item) => item.course);
    user.purchasedCourses.push(...purchasedCourses);

    await user.save();

    return NextResponse.json(
      { success: true, message: "خرید با موفقیت انجام شد" , refId:order.refId},
      { status: 200 },
    );
  } catch (err) {
    console.log(err);

    return NextResponse.json(
      { success: false, message: "خطای داخلی سرور" },
      { status: 500 },
    );
  }
}