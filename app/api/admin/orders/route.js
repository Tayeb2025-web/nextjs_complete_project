// app/api/admin/orders/route.js

import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Course from "@/models/Course";
import User from "@/models/User";
import { isAdmin } from "@/utils/auth";
import connectMongo from "@/configs/connectDB";

export async function GET(req) {
  try {
    // 1.admin check ==========================
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    await connectMongo();

    // 2.get orders ===========================
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || 1;
    const limit = 5;

    const orders = await Order.find()
      .populate({ path: "user", select: "name phone", model: User })
      .populate({ path: "items.course", select: "title slug", model: Course })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments({});

    return NextResponse.json(
      {
        success: true,
        orders,
        total,
      },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
