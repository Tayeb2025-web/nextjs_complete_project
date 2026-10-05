// app/api/admin/comments/[id]/reply/route.js

import { NextResponse } from "next/server";
import Comment from "@/models/Comment";
import { isAdmin } from "@/utils/auth";
import connectMongo from "@/configs/connectDB";

export async function POST(req, { params }) {
  try {
    await connectMongo();

    //admin check ==========================
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    const { id } = await params; // id کامنت اصلی

    const { text } = await req.json();

    if (!text || text.trim().length < 5) {
      return NextResponse.json(
        { success: false, message: "متن پاسخ حداقل ۵ کاراکتر باید باشد" },
        { status: 400 },
      );
    }

    const parentComment = await Comment.findById(id);
    if (!parentComment) {
      return NextResponse.json(
        { success: false, message: "کامنت اصلی یافت نشد" },
        { status: 404 },
      );
    }

    // ایجاد پاسخ ادمین
    const replyComment = await Comment.create({
      user: auth.adminId,
      course: parentComment.course,
      text: text.trim(),
      parentComment: id,
      isApproved: true, // پاسخ ادمین مستقیم نمایش داده بشه
      isAdminReply: true,
    });

    // populate برای برگرداندن اطلاعات
    const populatedReply = await Comment.findById(replyComment._id)
      .populate("user", "name")
      .lean();

    return NextResponse.json({
      success: true,
      message: "پاسخ با موفقیت ارسال شد",
      reply: populatedReply,
    });
  } catch (err) {
    console.error("Error adding admin reply:", err);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 },
    );
  }
}