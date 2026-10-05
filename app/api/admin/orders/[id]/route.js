// app/api/admin/orders/[id]/route.js

import { NextResponse } from "next/server";
import Order from "@/models/Order";
import { isAdmin } from "@/utils/auth";
import mongoose from "mongoose";
import connectMongo from "@/configs/connectDB";
export async function GET(req, { params }) {
  try {
    await connectMongo();

    // 1.admin check ==========================
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    const { id } = await params;

    // اعتبارسنجی ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "شناسه سفارش معتبر نیست." },
        { status: 400 },
      );
    }

    const order = await Order.findById(id)
      .populate("user", "name phone email")
      .populate({
        path: "items.course",
        select: "title slug thumbnail price discount",
      });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "سفارش پیدا نشد." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false, message: "خطای داخلی سرور" },
      { status: 500 },
    );
  }
}