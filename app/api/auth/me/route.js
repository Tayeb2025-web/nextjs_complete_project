import connectMongo from "@/configs/connectDB";
import User from "@/models/User";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Please log in to your account" },
        { status: 401 },
      );
    }

    // اعتبارسنجی توکن
    let payload;
    try {
      payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Token Expired or Invalid" },
        { status: 401 },
      );
    }

    await connectMongo();

    const user = await User.findById(payload.userId)
      .select("name phone email role createdAt purchasedCourses")
    //   .populate("purchasedCourses", "title slug thumbnail")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User Not Found" },
        { status: 404 },
      );
    }

     return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
