// /api/auth/checkout

import { NextResponse } from "next/server";
import User from "@/models/User";
import { getCurrentUser } from "@/utils/auth";
import connectMongo from "@/configs/connectDB";

export async function POST(req) {
  try {
    await connectMongo();

    const currentUser = getCurrentUser(req);
    if (!currentUser.success) {
      return NextResponse.json(
        {
          success: false,
          message: "ابتدا لاگین کنید",
        },
        { status: 401 },
      );
    }

    const { courseIds } = await req.json();

    const user = await User.findById(currentUser.userId);
    if (!user) {
      return NextResponse.json({ success: false , message: "کاربر پیدا نشد" } , { status: 404 });
    }

    user.purchasedCourses.push(...courseIds);

    await user.save();

    return NextResponse.json({
      success: true,
      message: "خرید با موفقیت انجام شد",
    });
  } catch (err) {
    console.error("Error in checkout:", err);
    return NextResponse.json({ success: false ,  message: "خطای سرور" }, { status: 500 });
  }
}