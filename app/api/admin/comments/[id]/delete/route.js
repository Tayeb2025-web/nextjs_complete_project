import { NextResponse } from "next/server";
import Comment from "@/models/Comment";
import { isAdmin } from "@/utils/auth";
import connectMongo from "@/configs/connectDB";

export async function DELETE (req, { params }) {
  try {
    await connectMongo();

    //admin check ==========================
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    const { id } = await params;

    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return NextResponse.json(
        { success: false, message: "کامنت یافت نشد" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "کامنت با موفقیت حذف شد",
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 },
    );
  }
}