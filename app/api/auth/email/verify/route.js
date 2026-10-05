
// ----------- (Backend API)  api/auth/email/verify [post]   ------------------- //

import connectMongo from "@/configs/connectDB";
import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { email, otpCode } = await req.json();

    // بررسی وجود ایمیل و کد OTP
    if (!email || !otpCode) {
      return NextResponse.json(
        { success: false, message: "email and OTP code required" },
        { status: 400 },
      );
    }

    await connectMongo();
    // پیدا کردن کاربر بر اساس ایمیل
    const user = await User.findOne({ email }).select(
      "name email role purchasedCourses otp",
    );
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // بررسی وجود OTP و تاریخ انقضا
    const { otp } = user;
    if (!otp || otp.code !== otpCode) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP code" },
        { status: 401 },
      );
    }

    const currentTime = new Date().getTime();
    const isExpired = currentTime > otp.expiresAt;
    if (isExpired) {
      // اگر OTP منقضی شده باشد
      user.otp = null; // حذف OTP
      await user.save();

      return NextResponse.json(
        { success: false, message: "OTP code is expired" },
        { status: 410 },
      );
    }

    // ✅ ساخت AccessToken و RefreshToken
    const accessPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = jwt.sign(
      accessPayload,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }, // 15 دقیقه
    );

    const refreshToken = jwt.sign(
      accessPayload,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }, // 7 روز
    );

    // ذخیره refreshToken در دیتابیس
    user.refreshToken = refreshToken;
    user.otp = null; // حذف OTP بعد از تایید
    user.isVerified = true;
    user.lastLoginAt = new Date();

    await user.save();

    // ✅ ذخیره در کوکی‌های HTTPOnly
    const cookieStore = await cookies();

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 1440 * 60, //  یک روز
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 روز
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        message: "OTP code is accepted",
        redirectTo: user.role === "admin" ? "/admin/dashboard" : "/profile",
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name || "",
          role: user.role,
          purchasedCourses: user.purchasedCourses || [],
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}