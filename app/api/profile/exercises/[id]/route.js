import connectMongo from "@/configs/connectDB";
import Exercise from "@/models/Exercise";
import ExerciseProgress from "@/models/ExerciseProgress";
import User from "@/models/User";
import { getCurrentUser } from "@/utils/auth";
import { isValidId } from "@/utils/adminValidation";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const auth = getCurrentUser(req);
  if (!auth.success) return auth;
  const { id } = await params;
  if (!isValidId(auth.userId))
    return NextResponse.json(
      { success: false, message: "حساب کاربری معتبر نیست" },
      { status: 401 },
    );
  if (!isValidId(id))
    return NextResponse.json(
      { success: false, message: "شناسه تمرین معتبر نیست" },
      { status: 400 },
    );
  try {
    const data = await req.json();
    if (!data || typeof data.completed !== "boolean")
      return NextResponse.json(
        { success: false, message: "وضعیت انجام تمرین معتبر نیست" },
        { status: 400 },
      );
    await connectMongo();
    const [user, exercise] = await Promise.all([
      User.exists({ _id: auth.userId }),
      Exercise.exists({ _id: id, status: "published" }),
    ]);
    if (!user)
      return NextResponse.json(
        { success: false, message: "حساب کاربری یافت نشد" },
        { status: 404 },
      );
    if (!exercise)
      return NextResponse.json(
        { success: false, message: "تمرین یافت نشد" },
        { status: 404 },
      );
    if (data.completed) {
      try {
        await ExerciseProgress.updateOne(
          { user: auth.userId, exercise: id },
          { $set: { completedAt: new Date() } },
          { upsert: true, runValidators: true },
        );
      } catch (error) {
        if (error.code !== 11000) throw error;
        await ExerciseProgress.updateOne(
          { user: auth.userId, exercise: id },
          { $set: { completedAt: new Date() } },
        );
      }
    } else {
      await ExerciseProgress.deleteOne({ user: auth.userId, exercise: id });
    }
    return NextResponse.json(
      {
        success: true,
        completed: data.completed,
        message: data.completed
          ? "تمرین به‌عنوان انجام‌شده ثبت شد"
          : "تمرین به فهرست انجام‌نشده برگشت",
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof SyntaxError
            ? "اطلاعات ارسالی معتبر نیست"
            : "خطا در ذخیره وضعیت تمرین",
      },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
