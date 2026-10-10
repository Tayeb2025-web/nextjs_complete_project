"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CourseCard from "@/components/ui/CourseCard";
import styles from "./Courses.module.css";

function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/categories", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.categories);
      })
      .catch((error) => {
        if (error.name !== "AbortError") console.error(error);
      });
    return () => controller.abort();
  }, [retry]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCourses = async () => {
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams({ limit: "100", category });
        const res = await fetch(`/api/courses/latests?${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error();

        const data = await res.json();
        setCourses(data.courses || []);
      } catch (err) {
        if (err.name !== "AbortError")
          setError("خطا در دریافت دوره‌ها؛ دوباره تلاش کنید.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchCourses();
    return () => controller.abort();
  }, [category, retry]);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <p className="sectionTitle">دوره های آموزشی</p>
      </div>

      <div className={styles.filters}>
        <label htmlFor="public-category">دسته‌بندی:</label>
        <select
          id="public-category"
          className={styles.filterSelect}
          value={category}
          onChange={(event) => {
            const query = new URLSearchParams(searchParams.toString());
            if (event.target.value) query.set("category", event.target.value);
            else query.delete("category");
            router.replace(`/courses${query.size ? `?${query}` : ""}`, {
              scroll: false,
            });
          }}
        >
          <option value="">همه دوره‌ها</option>
          {category && !categories.some((item) => item.slug === category) && (
            <option value={category}>دسته‌بندی انتخاب‌شده</option>
          )}
          {categories.map((item) => (
            <option key={item._id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <p>در حال بارگذاری دوره ها...</p>
        </div>
      ) : error ? (
        <div className={styles.emptyBox}>
          <p role="alert">{error}</p>
          <button
            className={styles.filterSelect}
            onClick={() => setRetry((value) => value + 1)}
          >
            تلاش دوباره
          </button>
        </div>
      ) : courses.length > 0 ? (
        <div className={styles.coursesGrid}>
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyBox}>
          <p>هیچ دوره ای یافت نشد</p>
        </div>
      )}
    </div>
  );
}

export default function Courses() {
  return (
    <Suspense
      fallback={
        <div className={styles.loadingBox}>در حال بارگذاری دوره‌ها...</div>
      }
    >
      <CoursesList />
    </Suspense>
  );
}
