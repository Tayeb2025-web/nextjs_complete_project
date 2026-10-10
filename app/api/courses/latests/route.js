import { NextResponse } from "next/server";
import Course from "@/models/Course";
import connectMongo from "@/configs/connectDB";
import Category from "@/models/Category";


export async function GET(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit")) || 4));
    const query = { status: "published" };
    const categorySlug = searchParams.get("category");
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug, isActive: true }).select("_id").lean();
      if (!category) return NextResponse.json({ courses: [] });
      query.category = category._id;
    }

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        "title slug shortDescription studentsCount thumbnail price discountPrice isFree level",
      )
      .lean();

    return NextResponse.json({ courses });
  } catch (err) {
    console.error("Error fetching latest courses:", err);
    return NextResponse.json(
      { message: "خطای سرور", messagetype: err.message },
      { status: 500 },
    );
  }
}
