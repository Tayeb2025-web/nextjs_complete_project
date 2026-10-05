// app/api/orders/route.js

import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Course from "@/models/Course";
import { getCurrentUser } from "@/utils/auth";
import connectMongo from "@/configs/connectDB";

export async function POST(req) {
  try {
    await connectMongo();

    // اعتبارسنجی توکن
    const user = getCurrentUser(req);

    if (!user.success) {
      return NextResponse.json(
        { success: false , message: "Unathuorized" },
        { status: 401 },
      );
    }

    const { courseIds } = await req.json();

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "courseIds is required" },
        { status: 400 },
      );
    }

    // دریافت دوره‌ها
    const courses = await Course.find({
      _id: { $in: courseIds },
    });

    if (courses.length !== courseIds.length) {
      return NextResponse.json(
        { success: false, message: "Some courses do not exist." },
        { status: 404 },
      );
    }

    // ساخت آیتم‌های سفارش
    const items = courses.map((course) => ({
      course: course._id,
      price: course.price,
    }));

    // محاسبه مبلغ نهایی
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

    // ایجاد سفارش
    const order = await Order.create({
      user: user.userId,
      items,
      totalPrice,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully.",
        orderId: order._id,
      },
      { status: 201 },
    );
  } catch (err) {
    console.log(err.message);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}