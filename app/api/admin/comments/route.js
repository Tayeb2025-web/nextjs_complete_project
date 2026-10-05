// app/api/admin/comments/route.js

import { NextResponse } from "next/server";
import Comment from "@/models/Comment";
import { isAdmin } from "@/utils/auth";
import connectMongo from "@/configs/connectDB";

export async function GET(req) {
  try {
    await connectMongo();

    // 1.admin check ==========================
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    // 2.get comments ==========================
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || 1;
    const limit = 5;

    const comments = await Comment.find({})
      .populate("user", "name phone -_id")
      .populate("course", "title slug -_id")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Comment.countDocuments({});

    return NextResponse.json(
      { success: true, comments, total },
      { status: 200 },
    );
  } catch (err) {
    console.log(err.message);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
}