"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MdCategory } from "react-icons/md";
import LastCourses from "./LastCourses";
import HomeLearningGuide from "./HomeLearningGuide";
import styles from "./Home.module.css";

export default function HomeCatalog() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const read = async (url) => {
      const response = await fetch(url, {
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(15000),
        ]),
      });
      if (!response.ok) throw new Error("دریافت اطلاعات ممکن نشد");
      return response.json();
    };
    (async () => {
      await Promise.allSettled([
        (async () => {
          try {
            const data = await read("/api/courses/latests?limit=100");
            if (!Array.isArray(data.courses))
              throw new Error("پاسخ معتبر نیست");
            if (!controller.signal.aborted) setCourses(data.courses);
          } catch {
            if (!controller.signal.aborted)
              setError("دوره‌ها بارگذاری نشدند. دوباره تلاش کنید.");
          } finally {
            if (!controller.signal.aborted) setLoading(false);
          }
        })(),
        (async () => {
          try {
            const data = await read("/api/categories");
            if (
              data.success &&
              Array.isArray(data.categories) &&
              !controller.signal.aborted
            )
              setCategories(data.categories);
          } catch {
            /* دسته‌بندی اختیاری است؛ دریافت دوره‌ها مستقل ادامه دارد. */
          }
        })(),
      ]);
    })();
    return () => controller.abort();
  }, [retry]);
  return (
    <>
      {categories.length > 0 && (
        <section
          className={`${styles.container} ${styles.categories}`}
          aria-label="موضوع‌های آموزشی"
        >
          <div>
            <MdCategory aria-hidden="true" />
            <h2>چه چیزی می‌خواهی یاد بگیری؟</h2>
          </div>
          <div className={styles.categoryLinks}>
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/courses?category=${encodeURIComponent(category.slug)}`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}
      <LastCourses
        courses={courses.slice(0, 4)}
        loading={loading}
        error={error}
        onRetry={() => setRetry((value) => value + 1)}
      />
      <HomeLearningGuide courses={courses} />
    </>
  );
}
