"use client";

import { useEffect, useId, useState } from "react";

export default function CourseCategorySelect({ value, onChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const inputId = useId();

  useEffect(() => {
    const controller = new AbortController();
    const loadCategories = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/categories", {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error("خطا در دریافت دسته‌بندی‌ها");
        setCategories(data.categories);
      } catch (error) {
        if (error.name !== "AbortError") setError(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadCategories();
    return () => controller.abort();
  }, [retry]);

  return (
    <>
      <label htmlFor={inputId}>دسته‌بندی دوره</label>
      <select
        id={inputId}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading || !!error}
      >
        <option value="">
          {loading ? "در حال دریافت دسته‌بندی‌ها..." : "بدون دسته‌بندی"}
        </option>
        {value && !categories.some((category) => category._id === value) && (
          <option value={value}>دسته‌بندی فعلی</option>
        )}
        {categories
          .filter((category) => category.isActive || category._id === value)
          .map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
              {!category.isActive ? " (غیرفعال)" : ""}
            </option>
          ))}
      </select>
      {error && (
        <p role="alert">
          {error}{" "}
          <button type="button" onClick={() => setRetry((value) => value + 1)}>
            تلاش دوباره
          </button>
        </p>
      )}
    </>
  );
}
