import connectMongo from "@/configs/connectDB";
import Course from "@/models/Course";
import { isAdmin } from "@/utils/auth";
import { NextResponse } from "next/server";
import Category from "@/models/Category";
import { isValidId } from "@/utils/adminValidation";

export async function GET(req) {
  try {
    await connectMongo();

    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const query = search ? { title: { $regex: search } } : {};
    const category = searchParams.get("category");
    if (category === "none") query.category = null;
    else if (category) {
      if (!isValidId(category)) return NextResponse.json({ success: false, message: "شناسه دسته‌بندی معتبر نیست" }, { status: 400 });
      query.category = category;
    }

    const courses = await Course.find(query).populate("category", "name").sort({ createdAt: -1 });

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 },
    );
  }
}
