
// -------   (Backend API)  api/auth/email/send [post]   ------------------- //

import connectMongo from "@/configs/connectDB";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.EMAIL_OTP_API_KEY);

const validateEmail = (email) => {
  const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ ;
  const emailResult = email_regex.test(email);
  return emailResult;
};

export async function POST(req) {
  
    try {
    const { email } = await req.json();

    // اعتبارسنجی ایمیل
    if (!email) {
      return NextResponse.json(
        { success: false, message: "email is required" },
        { status: 400 },
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format"}, { status: 400 });
    }

      await connectMongo();

      // جلوگیری از اسپم: بررسی OTP فعال
      const user = await User.findOne({ email });

      if (user && user.otp.expiresAt > new Date()) {
        return NextResponse.json(
          {success: false, message: "OTP already sent. Please wait before requesting again."},
          { status: 429 }
        );
      }

    // تولید OTP جدید
    const otpCode = Math.floor(Math.random() * 90000) + 10000;
    const expiresAt = new Date().getTime() + 86400 * 1000; // OTP بعد از 120 ثانیه منقضی می‌شود

     // ارسال OTP از طریق email
     const {data , error} = await resend.emails.send({
      from: "STP <onboarding@resend.dev>" ,
      to: [email] ,
      subject: "Your Verification Code" ,
      text: `Your verification code is: ${otpCode}. This code will expire in 2 minutes`
     })

   // بررسی خطای Resend
    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({success: false,message: "Failed to send OTP" }, { status: 500 } )
    }

       // ذخیره OTP در Database
    if (user) {
      user.otp.code = otpCode;
      user.otp.expiresAt = expiresAt;

      await user.save();
    } else {
      await User.create({
        email ,
        otp: {
          code: otpCode,
          expiresAt
        }
      })
    }

    return NextResponse.json(
      {success: true, message: "OTP sent successfully"}, { status: 200 }
    );

  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}