"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./Courses.module.css";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/categories", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => { if (data.success) setCategories(data.categories); })
      .catch((error) => { if (error.name !== "AbortError") console.error(error); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const getCourses = async () => {
      setLoading(true);
      setMessage({ text: "", type: "" });
      try {
        const query = new URLSearchParams({ search: searchTerm, category });
        const res = await fetch(`/api/admin/courses?${query}`, { signal: controller.signal, cache: "no-store" });
        if (!res.ok) throw new Error();

        const data = await res.json();
        setCourses(data.courses || []);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setMessage({ text: "خطا در بارگذاری لیست دوره‌ها", type: "error" });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    getCourses();
    return () => controller.abort();
  }, [searchTerm, category]);

  const deleteCourse = async (slug) => {
    if (!confirm(" مطمئنی میخوای دوره رو حذف کنی؟")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/courses/${slug}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setCourses((prev) => prev.filter((c) => c.slug !== slug));
        toast.success("دوره با موفقیت حذف شد");
      } else {
        toast.error("خطا در حذف دوره");
      }
    } catch (err) {
      toast.error("خطای سرور");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>در حال بارگذاری دوره‌ها...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>مدیریت دوره‌ها</h1>
        <Link href="/admin/courses/add" className={styles.addButton}>
          + اضافه کردن دوره جدید
        </Link>
      </div>

      {/* جستجو */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="جستجو در عنوان..."
          className={styles.searchInput}
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
        <select className={styles.filterSelect} aria-label="فیلتر دسته‌بندی" value={category} onChange={(event) => {
          const query = new URLSearchParams(searchParams.toString());
          if (event.target.value) query.set("category", event.target.value); else query.delete("category");
          router.replace(`/admin/courses${query.size ? `?${query}` : ""}`, { scroll: false });
        }}>
          <option value="">همه دسته‌بندی‌ها</option><option value="none">بدون دسته‌بندی</option>
          {categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
        </select>
      </div>

      {message.text && (
        <p className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </p>
      )}

      {courses.length === 0 ? (
        <p className={styles.empty}>هیچ دوره‌ای یافت نشد.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>تصویر</th>
                <th>عنوان دوره</th>
                <th>دسته‌بندی</th>
                <th>قیمت</th>
                <th>درس‌ها</th>
                <th>وضعیت</th>
                <th>تاریخ ایجاد</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td className={styles.thumbnailCell}>
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        width={80}
                        height={50}
                        className={styles.thumbnailImg}
                      />
                    ) : (
                      <div className={styles.noImage}>بدون تصویر</div>
                    )}
                  </td>
                  <td className={styles.titleCell}>
                    <Link href={`#`} className={styles.courseLink}>
                      {course.title}
                    </Link>
                  </td>
                  <td>{course.category?.name || "بدون دسته‌بندی"}</td>
                  <td>
                    {course.isFree ? (
                      <span className={styles.freeBadge}>رایگان</span>
                    ) : (
                      <>
                        {course.discountPrice ? (
                          <>
                            <del>{course.price?.toLocaleString()} تومان</del>
                            <span className={styles.discountPrice}>
                              {course.discountPrice?.toLocaleString()} تومان
                            </span>
                          </>
                        ) : (
                          `${course.price?.toLocaleString()} تومان`
                        )}
                      </>
                    )}
                  </td>
                  <td>{course.lessonsCount || 0}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[course.status]
                      }`}
                    >
                      {course.status === "published"
                        ? "منتشر شده"
                        : course.status === "draft"
                          ? "پیش‌نویس"
                          : course.status === "coming-soon"
                            ? "به زودی"
                            : course.status}
                    </span>
                  </td>
                  <td dir="ltr">
                    {new Date(course.createdAt).toLocaleDateString("fa-IR")}
                  </td>
                  <td className={styles.courseActionsCell}>
                    <div className={styles.courseActions}>
                      <Link
                        href={`/admin/courses/${course.slug}/edit`}
                        className={styles.editBtn}
                      >
                        ویرایش
                      </Link>

                      <button className={styles.statusBtn}>
                        {course.status === "published" ? "غیرفعال" : "انتشار"}
                      </button>

                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteCourse(course.slug)}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Courses() {
  return (
    <Suspense fallback={<div className={styles.container}>در حال بارگذاری دوره‌ها...</div>}>
      <CoursesList />
    </Suspense>
  );
}
