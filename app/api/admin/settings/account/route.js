import connectMongo from "@/configs/connectDB";
import User from "@/models/User";
import { isAdmin } from "@/utils/auth";
import { NextResponse } from "next/server";

const fields = "name email phone role createdAt";

export async function GET(req) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  try {
    await connectMongo();
    const user = await User.findOne({ _id: auth.adminId, role: "admin" })
      .select(fields)
      .lean();
    if (!user)
      return NextResponse.json(
        { success: false, message: "حساب مدیر یافت نشد" },
        { status: 403 },
      );
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت حساب مدیر" },
      { status: 500 },
    );
  }
}

export async function PATCH(req) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  try {
    const data = await req.json();
    if (typeof data?.name !== "string" || typeof data?.phone !== "string")
      return NextResponse.json(
        { success: false, message: "نام و شماره تماس معتبر وارد کنید" },
        { status: 400 },
      );
    const name = data.name.trim();
    const phone = data.phone.trim();
    if (name.length < 2 || name.length > 50)
      return NextResponse.json(
        { success: false, message: "نام باید بین ۲ تا ۵۰ کاراکتر باشد" },
        { status: 400 },
      );
    if (phone && !/^\+?[\d\s()-]{5,30}$/.test(phone))
      return NextResponse.json(
        { success: false, message: "شماره تماس معتبر نیست" },
        { status: 400 },
      );
    await connectMongo();
    const user = await User.findOneAndUpdate(
      { _id: auth.adminId, role: "admin" },
      { $set: { name, phone } },
      { returnDocument: "after", runValidators: true },
    ).select(fields);
    if (!user)
      return NextResponse.json(
        { success: false, message: "حساب مدیر یافت نشد" },
        { status: 403 },
      );
    return NextResponse.json({
      success: true,
      user,
      message: "اطلاعات حساب مدیر ذخیره شد",
    });
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        message:
          status === 400
            ? "اطلاعات ارسالی معتبر نیست"
            : "خطا در ذخیره حساب مدیر",
      },
      { status },
    );
  }
}
