import { NextResponse } from "next/server";

import Comment from "@/models/Comment"; // مدل کامنت
import Course from "@/models/Course"; // مدل دوره
import { getCurrentUser } from "@/utils/auth";
import connectMongo from "@/configs/connectDB";

export async function POST(req, { params }) {
  try {
    // اعتبارسنجی توکن
    const currentUser = getCurrentUser(req);
    if (!currentUser.success) {
      return NextResponse.json(
        {
          success: false,
          message: "please login",
        },
        { status: 401 },
      );
    }

    await connectMongo();

    const userId = currentUser.userId;
    const { slug } = await params;

    // دریافت داده‌ها از بدنه درخواست
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { success: false, message: "comment body is required" },
        { status: 400 },
      );
    }

    // یافتن دوره
    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    // ایجاد کامنت جدید
    const newComment = await Comment.create({
      user: userId,
      course: course._id,
      text: text.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Comment submitted successfully",
        comment: newComment, // ارسال کامنت تازه ایجاد شده
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/comments error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}