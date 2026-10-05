import { NextResponse } from "next/server";
import Course from "@/models/Course";
import connectMongo from "@/configs/connectDB";


export async function GET(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 4;

    const courses = await Course.find({ status: "published" })
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
