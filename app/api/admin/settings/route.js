import connectMongo from "@/configs/connectDB";
import Setting from "@/models/Setting";
import { isAdmin } from "@/utils/auth";
import { getSiteSettings, publicSiteSettings } from "@/utils/siteSettings";
import { validateSiteSettings } from "@/configs/siteSettings";
import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  try {
    return NextResponse.json({
      success: true,
      settings: await getSiteSettings(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت تنظیمات" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  try {
    const { value, error } = validateSiteSettings(await req.json());
    if (error)
      return NextResponse.json(
        { success: false, message: error },
        { status: 400 },
      );
    await connectMongo();
    const settings = await Setting.findOneAndUpdate(
      { key: "general" },
      { $set: value },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
    return NextResponse.json({
      success: true,
      settings: publicSiteSettings(settings),
      message: "تنظیمات با موفقیت ذخیره شد",
    });
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        message:
          status === 400 ? "اطلاعات ارسالی معتبر نیست" : "خطا در ذخیره تنظیمات",
      },
      { status },
    );
  }
}
