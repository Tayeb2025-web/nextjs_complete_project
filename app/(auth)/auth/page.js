"use client";
import { useEffect, useState } from "react";
import styles from "./AuthPage.module.css";

import { IoMdArrowRoundBack } from "react-icons/io";
import OtpInputs from "@/components/features/auth/OtpInputs";
import toast from "react-hot-toast";
import Loader from "@/components/shared/Loader";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const router = useRouter()

  const {setUser} = useAuth()

  // اعتبارسنجی ایمیل
  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setIsCodeSent(true);
        toast.success("کد تایید با موفقیت ارسال شد");
      } else {
        toast.error("خطا در ارسال کد تایید");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در ارسال کد تایید");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setOtp(['','','','',''])
    setIsCodeSent(false)
    setTimer(120)
    setEmail('')
  };

  const handleVerifyOtp = async () => {
    const otpCode = `${otp[0]}${otp[1]}${otp[2]}${otp[3]}${otp[4]}`;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/email/verify' , {
      method: "POST" ,
      body: JSON.stringify({otpCode,email}),
      headers: {"Content-Type" : "application/json"} , 
      credentials: "include" ,
    })

    const data = await res.json()
    
    if(res.status==200) {
      toast.success('با موفقیت وارد شدید');
      router.push(data.redirectTo)
      setUser(data.user)
    } else{
      if(res.status==401){
        toast.error('کد تایید اشتباه است')
      } else if(res.status==410){
        toast.error('کد تایید منقضی شده است')
      } else {
        toast.error('خطا در ورود')
      }
    }
    } catch (error) {
      toast.error('خطای سرور بعدا تلاش کنید')
    }
    finally{
       setIsLoading(false);
    }
    
  };

  const handleResendOtp = async () => {
    try {
      const res = await fetch("/api/auth/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("کد تایید با موفقیت ارسال شد");
        setOtp(["", "", "", "", ""])
        setTimer(120)
      } else {
        toast.error("خطا در ارسال کد تایید");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در ارسال کد تایید");
    }
  };

  const isOtpComplete = otp.every((input) => input !== "");

  useEffect(() => {
    let interval;
    if (isCodeSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((time) => time - 1);
      }, 1000);
    } else if (timer == 0) {
      console.log("tamoma");
    }

    return () => clearInterval(interval);
  }, [isCodeSent, timer]);

  return (
    <div className={styles.authWrapper}>
      <div className={styles.right}></div>
      <div className={styles.authForm}>
        {!isCodeSent && (
          <>
            <h2>سید طیب پویا</h2>
            <h3>ورود | ثبت نام</h3>
            <p>لطفا ایمیل خود را وارد کنید</p>
            <input
              type="text"
              placeholder="ایمیل"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {isLoading ? (
              <Loader />
            ) : (
              <button
                onClick={handleSendOtp}
                disabled={!isEmailValid(email)} // دکمه ورود فقط زمانی فعال می‌شود که ایمیل معتبر باشد
              >
                ورود
              </button>
            )}
          </>
        )}
        {isCodeSent && (
          <>
            <h2>سورن کد</h2>
            <div className={styles.gotoBack} onClick={handleBackToEmail}>
              <IoMdArrowRoundBack size={"20px"} />
            </div>
            <p>کد تایید برای ایمیل ذیل ارسال شد: <br /> {email} </p>
            <h3>کد تایید را وارد کنید</h3>
            <OtpInputs otp={otp} setOtp={setOtp} />
            {isLoading ? (
              <Loader />
            ) : (
              <button
                onClick={handleVerifyOtp}
                disabled={!isOtpComplete} // دکمه فقط زمانی فعال می‌شود که OTP کامل شده باشد
              >
                تأیید و ورود
              </button>
            )}
            <div className={styles.resendOtp}>
              {timer > 0 ? (
                <p className={styles.timer}>
                  ارسال مجدد کد تا {timer} ثانیه دیگر
                </p>
              ) : (
                <p
                  className={styles.resend}
                  onClick={handleResendOtp}
                  disabled={isResendDisabled}
                >
                  دریافت مجدد کد تایید
                </p>
              )}
            </div>
          </>
        )}
      </div>
      <div className={styles.left}></div>
    </div>
  );
}

// localhost:3000/auth
