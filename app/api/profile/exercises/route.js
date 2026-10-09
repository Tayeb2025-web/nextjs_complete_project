import connectMongo from "@/configs/connectDB";
import ExerciseProgress from "@/models/ExerciseProgress";
import "@/models/Exercise";
import User from "@/models/User";
import { getCurrentUser } from "@/utils/auth";
import { isValidId } from "@/utils/adminValidation";
import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = getCurrentUser(req);
  if (!auth.success) return auth;
  if (!isValidId(auth.userId))
    return NextResponse.json(
      { success: false, message: "حساب کاربری معتبر نیست" },
      { status: 401 },
    );
  try {
    await connectMongo();
    if (!(await User.exists({ _id: auth.userId })))
      return NextResponse.json(
        { success: false, message: "حساب کاربری یافت نشد" },
        { status: 404 },
      );
    const progress = await ExerciseProgress.find({ user: auth.userId })
      .populate({
        path: "exercise",
        select: "_id",
        match: { status: "published" },
      })
      .lean();
    return NextResponse.json(
      {
        success: true,
        completedIds: progress
          .filter((p) => p.exercise)
          .map((p) => String(p.exercise._id)),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت وضعیت تمرین‌ها" },
      { status: 500 },
    );
  }
}
