"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";

export default function useProfileLibrary(endpoint) {
  const { user, loading: authLoading } = useAuth();
  const ownerId = user?.id || user?._id || null;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    setError("");
    if (authLoading) {
      setLoading(true);
      return () => controller.abort();
    }
    if (!ownerId) {
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    (async () => {
      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok || !data.success)
          throw new Error(
            [401, 403].includes(response.status)
              ? "نشست شما پایان یافته است؛ دوباره وارد حساب شوید."
              : data.message || "خطا در دریافت اطلاعات",
          );
        if (!controller.signal.aborted) setResult({ ...data, ownerId });
      } catch (error) {
        if (!controller.signal.aborted)
          setError(error.message || "خطای ارتباط با سرور");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [endpoint, ownerId, authLoading, retry]);
  // اطلاعات حساب قبلی حتی در فاصلهٔ اجرای افکت نمایش داده نشود.
  const data = result?.ownerId === ownerId ? result : null;
  return {
    data,
    loading: authLoading || loading || (!!ownerId && !!result && !data),
    error,
    ownerId,
    signedOut: !authLoading && !ownerId,
    reload: () => setRetry((value) => value + 1),
  };
}
