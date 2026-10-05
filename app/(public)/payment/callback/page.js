"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { useCart } from "@/contexts/cartContext";
import { useAuth } from "@/contexts/authContext";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { clearCart } = useCart();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({
    success: false,
    message: "",
    refId: "",
  });

  useEffect(() => {
    const verifyPayment = async () => {
      const authority = searchParams.get("Authority");
      const status = searchParams.get("Status");

      if (!authority || !status) {
        setLoading(false);

        return setResult({
          success: false,
          message: "خطا در ثبت سفارش",
          refId: "",
        });
      }

      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authority,
            status,
          }),
        });

        const data = await res.json();

        setLoading(false);

        setResult({
          success: data.success,
          message: data.message,
          refId: data.refId || "",
        });

        if (data.success) {
          await refreshUser();
          clearCart();
        }
      } catch {
        setLoading(false);

        setResult({
          success: false,
          message: "خطا در ارتباط با سرور",
          refId: "",
        });
      }
    };

    verifyPayment();
  }, [searchParams, refreshUser, clearCart]);

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.loader}></div>
        <h2>در حال بررسی پرداخت...</h2>
        <p>لطفاً چند لحظه صبر کنید.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={result.success ? styles.successIcon : styles.errorIcon}>
        {result.success ? "✓" : "✕"}
      </div>

      <h1>{result.success ? "پرداخت موفق" : "پرداخت ناموفق"}</h1>

      <p>{result.message}</p>

      {result.success && result.refId && (
        <div className={styles.refBox}>
          شماره پیگیری
          <strong>{result.refId}</strong>
        </div>
      )}

      <button
        onClick={() =>
          router.push(result.success ? "/profile/courses" : "/cart")
        }
      >
        {result.success ? "مشاهده دوره‌های من" : "بازگشت به سبد خرید"}
      </button>
    </div>
  );
}

export default function PaymentCallback() {
  return (
    <Suspense
      fallback={
        <div className={styles.card}>
          <div className={styles.loader}></div>
          <h2>در حال بررسی پرداخت...</h2>
          <p>لطفاً چند لحظه صبر کنید.</p>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}