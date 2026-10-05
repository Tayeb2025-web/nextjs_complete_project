"use client";

import { useEffect, useState } from "react";
import styles from "./Courses.module.css";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getCourses = async () => {
      try {
        const res = await fetch(`/api/admin/courses?search=${searchTerm}`);
        if (!res.ok) throw new Error();

        const data = await res.json();
        setCourses(data.courses || []);
      } catch (err) {
        console.error(err);
        setMessage({ text: "خطا در بارگذاری لیست دوره‌ها", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    getCourses();
  }, [searchTerm]);

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
        />
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
                  <td className={styles.actions}>
                    <Link href={`/admin/courses/${course.slug}/edit`} className={styles.editBtn}>
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
