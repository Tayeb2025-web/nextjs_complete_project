// app/api/admin/comments/[id]/approve/route.js

import { NextResponse } from "next/server";
import Comment from "@/models/Comment";
import { isAdmin } from "@/utils/auth";
import connectMongo from "@/configs/connectDB";

export async function PATCH(req, { params }) {
  try {
    await connectMongo();

    //admin check =======================
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    const { id } = await params;
    const { isApproved } = await req.json();

    const comment = await Comment.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true },
    ).populate("user", "name");

    if (!comment) {
      return NextResponse.json(
        { success: false, message: "کامنت یافت نشد" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `کامنت ${isApproved ? "تأیید" : "رد"} شد`,
      comment,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 },
    );
  }
}