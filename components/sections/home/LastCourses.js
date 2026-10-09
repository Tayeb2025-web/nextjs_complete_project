"use client";
import styles from "./LastCourses.module.css";
import CourseCard from "@/components/ui/CourseCard";
import Link from "next/link";

export default function LastCourses({
  courses = [],
  loading = false,
  error = "",
  onRetry,
}) {
  return (
    <section className={styles.section} aria-labelledby="latest-courses-title">
      <div className="sectionHeader">
        <h2 id="latest-courses-title" className="sectionTitle">
          آخرین دوره‌های آموزشی
        </h2>
        <Link href="/courses">
          <p className="sectionMore">همه دوره ها</p>
        </Link>
      </div>
      <div className={styles.lastCourses}>
        {loading ? (
          <div
            className={styles.loading}
            role="status"
            aria-label="در حال بارگذاری دوره‌ها"
          >
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className={styles.skeleton} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.empty}>
            <p role="alert">{error}</p>
            <button type="button" onClick={onRetry}>
              تلاش دوباره
            </button>
          </div>
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))
        ) : (
          <p className={styles.empty}>
            دوره‌های جدید به‌زودی در این بخش قرار می‌گیرند.
          </p>
        )}
      </div>
    </section>
  );
}
