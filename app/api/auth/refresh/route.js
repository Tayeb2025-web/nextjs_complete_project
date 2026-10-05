import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { NextResponse } from "next/server";
import connectMongo from "@/configs/connectDB";

export async function POST() {
  const cookieStore = await cookies();

  try {
    const refreshToken = cookieStore.get("refreshToken").value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Refresh token not provided" },
        { status: 401 },
      );
    }

    // Refresh Token Validation ======================================================
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      // اگر توکن نامعتبر یا منقضی بود، کوکی رو پاک کن
      cookieStore.delete("refreshToken", { path: "/" });
      cookieStore.delete("accessToken", { path: "/" });
      return NextResponse.json(
        { success: false, message: "Invalid or expired refresh token" },
        { status: 401 },
      );
    }

    await connectMongo();

    const user = await User.findById(payload.userId);
    if (!user) {
      cookieStore.delete("accessToken", { path: "/" });
      cookieStore.delete("refreshToken", { path: "/" });
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // generate new accessToken ==========================================================
    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1440m" },
    );

    const response = NextResponse.json({
      success: true,
      message: "accessToken Refreshed Successfully",
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role || "user",
      },
    });

    // access token set
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1440 * 60, // 1440 دقیقه
      path: "/",
    });

    return response;

  } catch (error) {
    cookieStore.delete("accessToken", { path: "/" });
    cookieStore.delete("refreshToken", { path: "/" });

    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }}