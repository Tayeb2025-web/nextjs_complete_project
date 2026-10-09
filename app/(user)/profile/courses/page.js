"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBookOpen, FaClock, FaPlayCircle, FaKey } from "react-icons/fa";
import CourseChapter from "@/components/sections/course/CourseChapter";
import useProfileLibrary from "@/components/shared/profile/useProfileLibrary";
import LibraryState from "@/components/shared/profile/LibraryState";
import styles from "@/components/shared/profile/Library.module.css";

const levels = {
  beginner: "مبتدی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
};
export default function Courses() {
  const library = useProfileLibrary("/api/profile/courses");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState(null);
  const [content, setContent] = useState(null);
  const [contentError, setContentError] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setContent(null);
    setContentError("");
    if (!selected || selected.ownerId !== library.ownerId) {
      setContentLoading(false);
      return () => controller.abort();
    }
    setContentLoading(true);
    (async () => {
      try {
        const response = await fetch(`/api/profile/courses/${selected.id}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || !data.success)
          throw new Error(data.message || "خطا در دریافت جلسات دوره");
        if (!controller.signal.aborted)
          setContent({ ...data.course, ownerId: library.ownerId });
      } catch (error) {
        if (!controller.signal.aborted) setContentError(error.message);
      } finally {
        if (!controller.signal.aborted) setContentLoading(false);
      }
    })();
    return () => controller.abort();
  }, [selected, library.ownerId, retry]);
  const courses = library.data?.courses || [];
  const categories = [
    ...new Map(
      courses
        .filter((course) => course.category)
        .map((course) => [course.category._id, course.category]),
    ).values(),
  ];
  const filtered = courses.filter(
    (course) =>
      (!category || course.category?._id === category) &&
      course.title.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const showContent = selected && selected.ownerId === library.ownerId;
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>دوره‌های من</h1>
          <p>دوره‌های ثبت‌شده در حساب شما و دسترسی به جلسات آموزش</p>
        </div>
        <Link className={styles.secondary} href="/courses">
          مشاهدهٔ همهٔ دوره‌ها
        </Link>
      </header>
      {!library.loading && !library.error && !library.signedOut && (
        <>
          <div className={styles.filters}>
            <input
              aria-label="جستجو در دوره‌های من"
              placeholder="جستجو در دوره‌های من..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              aria-label="دسته‌بندی دوره"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">همهٔ دسته‌بندی‌ها</option>
              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            <span>{filtered.length.toLocaleString("fa-IR")} دوره</span>
            <button className={styles.secondary} onClick={library.reload}>
              به‌روزرسانی
            </button>
          </div>
          {library.data?.unavailableCount > 0 && (
            <p className={`${styles.message} ${styles.notice}`}>
              اطلاعات بعضی از دوره‌های ثبت‌شده فعلاً در دسترس نیست. برای بررسی
              با پشتیبانی تماس بگیرید.
            </p>
          )}
        </>
      )}
      <LibraryState
        {...library}
        empty={!filtered.length}
        filtered={!!search || !!category}
      />
      {!library.loading && !library.error && !library.signedOut && (
        <>
          {showContent && (
            <section className={styles.panel} aria-live="polite">
              <div className={styles.panelHeader}>
                <h2>{selected.title}</h2>
                <button
                  className={styles.secondary}
                  onClick={() => setSelected(null)}
                >
                  بستن جلسات
                </button>
              </div>
              {contentLoading ? (
                <p className={styles.hint}>در حال دریافت جلسات...</p>
              ) : contentError ? (
                <>
                  <p
                    role="alert"
                    className={`${styles.message} ${styles.error}`}
                  >
                    {contentError}
                  </p>
                  <button
                    className={styles.secondary}
                    onClick={() => setRetry((value) => value + 1)}
                  >
                    تلاش دوباره
                  </button>
                </>
              ) : (
                content?.ownerId === library.ownerId &&
                content?._id === selected.id && (
                  <CourseChapter key={content._id} course={content} hasAccess />
                )
              )}
            </section>
          )}
          <div className={styles.grid}>
            {filtered.map((course) => (
              <article key={course._id} className={styles.card}>
                {course.thumbnail ? (
                  <Image
                    className={styles.cover}
                    src={course.thumbnail}
                    alt={course.title}
                    width={480}
                    height={270}
                  />
                ) : (
                  <div className={styles.placeholder}>
                    <FaBookOpen />
                  </div>
                )}
                <div className={styles.body}>
                  <div className={styles.actions}>
                    <span
                      className={`${styles.badge} ${course.status === "published" ? styles.active : styles.pending}`}
                    >
                      {course.status === "published"
                        ? "دسترسی فعال"
                        : "محتوا فعلاً در دسترس نیست"}
                    </span>
                    {course.category && (
                      <span className={styles.hint}>
                        {course.category.name}
                      </span>
                    )}
                  </div>
                  <h2>{course.title}</h2>
                  <p className={styles.description}>
                    {course.shortDescription}
                  </p>
                  <div className={styles.meta}>
                    <span>
                      <FaPlayCircle />
                      {course.lessonsCount.toLocaleString("fa-IR")} جلسه
                    </span>
                    <span>
                      <FaClock />
                      {course.totalDuration}
                    </span>
                    <span>{levels[course.level]}</span>
                  </div>
                  {course.purchasedAt && (
                    <p>
                      تاریخ خرید:{" "}
                      {new Date(course.purchasedAt).toLocaleDateString("fa-IR")}
                    </p>
                  )}
                  <div className={styles.cardFooter}>
                    <button
                      className={styles.button}
                      disabled={course.status !== "published"}
                      onClick={() => {
                        setSelected({
                          id: course._id,
                          title: course.title,
                          ownerId: library.ownerId,
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <FaPlayCircle />
                      مشاهدهٔ جلسات
                    </button>
                    <Link className={styles.secondary} href="/profile/licences">
                      <FaKey />
                      لایسنس
                    </Link>
                    {course.status === "published" && (
                      <Link
                        className={styles.secondary}
                        href={`/course/${course.slug}`}
                      >
                        اطلاعات دوره
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
