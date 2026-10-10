"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";

export default function useExerciseProgress(enabled = true) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id || user?._id || "";
  const [state, setState] = useState({
    owner: "",
    ids: [],
    loading: false,
    error: "",
  });
  const [retry, setRetry] = useState(0);
  const [savingId, setSavingId] = useState("");
  useEffect(() => {
    if (!enabled || !userId) {
      setState({ owner: "", ids: [], loading: false, error: "" });
      return;
    }
    const controller = new AbortController();
    let timeout = false;
    const timer = setTimeout(() => {
      timeout = true;
      controller.abort();
    }, 15000);
    setState({ owner: userId, ids: [], loading: true, error: "" });
    (async () => {
      try {
        const res = await fetch("/api/profile/exercises", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(
            res.status === 401
              ? "برای دریافت وضعیت تمرین‌ها دوباره وارد حساب شوید."
              : data.message || "خطا در دریافت وضعیت تمرین‌ها",
          );
        if (!controller.signal.aborted)
          setState({
            owner: userId,
            ids: data.completedIds,
            loading: false,
            error: "",
          });
      } catch (error) {
        if (!controller.signal.aborted || timeout)
          setState({
            owner: userId,
            ids: [],
            loading: false,
            error: timeout
              ? "دریافت وضعیت تمرین‌ها طول کشید؛ دوباره تلاش کنید."
              : error.message,
          });
      } finally {
        clearTimeout(timer);
      }
    })();
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, userId, retry]);

  const save = useCallback(
    async (exerciseId, completed) => {
      if (!userId || savingId) return;
      setSavingId(exerciseId);
      try {
        const res = await fetch("/api/profile/exercises/" + exerciseId, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        });
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(
            res.status === 401
              ? "برای ثبت وضعیت دوباره وارد حساب شوید."
              : data.message || "خطا در ذخیره وضعیت تمرین",
          );
        setState((previous) =>
          previous.owner !== userId
            ? previous
            : {
                ...previous,
                ids: data.completed
                  ? [...new Set([...previous.ids, exerciseId])]
                  : previous.ids.filter((id) => id !== exerciseId),
              },
        );
        toast.success(data.message);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setSavingId("");
      }
    },
    [userId, savingId],
  );

  return {
    user,
    authLoading,
    completedIds: state.owner === userId ? state.ids : [],
    loading: !!userId && (state.owner !== userId || state.loading),
    error: state.owner === userId ? state.error : "",
    retry: () => setRetry((value) => value + 1),
    save,
    savingId,
  };
}
