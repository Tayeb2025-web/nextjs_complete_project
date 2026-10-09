import { getSiteSettings } from "@/utils/siteSettings";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      settings: await getSiteSettings(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعات سایت" },
      { status: 500 },
    );
  }
}
