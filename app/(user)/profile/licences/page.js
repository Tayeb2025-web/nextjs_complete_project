"use client";

import { useState } from "react";
import Link from "next/link";
import { FaKey, FaCopy, FaDownload } from "react-icons/fa";
import toast from "react-hot-toast";
import { useSiteSettings } from "@/contexts/siteSettingsContext";
import useProfileLibrary from "@/components/shared/profile/useProfileLibrary";
import LibraryState from "@/components/shared/profile/LibraryState";
import styles from "@/components/shared/profile/Library.module.css";

export default function Licences() {
  const settings = useSiteSettings();
  const library = useProfileLibrary("/api/profile/licences");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const courses = library.data?.courses || [];
  const filtered = courses.filter((course) => {
    const state = !course.licence
      ? "pending"
      : course.licence.isActive
        ? "active"
        : "inactive";
    return (
      (!status || status === state) &&
      course.title.toLowerCase().includes(search.trim().toLowerCase())
    );
  });
  const copyKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success("کلید لایسنس کپی شد");
    } catch {
      toast.error("کپی خودکار ممکن نیست؛ کلید را از کادر انتخاب و کپی کنید.");
    }
  };
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>لایسنس‌های من</h1>
          <p>کلیدهای اختصاصی دوره‌های شما برای پخش در SpotPlayer</p>
        </div>
        <Link className={styles.secondary} href="/profile/courses">
          دوره‌های من
        </Link>
      </header>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>راهنمای استفاده از لایسنس</h2>
          <a
            className={styles.secondary}
            href="https://spotplayer.ir/#download"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaDownload />
            دریافت SpotPlayer
          </a>
        </div>
        <ol className={styles.steps}>
          <li>نسخهٔ مناسب دستگاه خود را از وب‌سایت SpotPlayer نصب کنید.</li>
          <li>
            کلید لایسنس دوره را کپی کنید و در بخش ثبت دورهٔ پلیر قرار دهید.
          </li>
          <li>
            لایسنس به حساب شما اختصاص دارد؛ آن را در اختیار دیگران قرار ندهید.
          </li>
        </ol>
      </section>
      {!library.loading && !library.error && !library.signedOut && (
        <div className={styles.filters}>
          <input
            aria-label="جستجوی لایسنس دوره"
            placeholder="جستجو بر اساس نام دوره..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            aria-label="وضعیت لایسنس"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">همهٔ وضعیت‌ها</option>
            <option value="active">ثبت‌شده</option>
            <option value="pending">در انتظار ثبت</option>
            <option value="inactive">غیرفعال</option>
          </select>
          <span>
            {courses
              .filter((course) => course.licence?.isActive)
              .length.toLocaleString("fa-IR")}{" "}
            لایسنس ثبت‌شده
          </span>
          <button className={styles.secondary} onClick={library.reload}>
            به‌روزرسانی
          </button>
        </div>
      )}
      {!library.loading && library.data?.unavailableCount > 0 && (
        <p className={`${styles.message} ${styles.notice}`}>
          اطلاعات بعضی از دوره‌های شما فعلاً در دسترس نیست؛ با پشتیبانی تماس
          بگیرید.
        </p>
      )}
      <LibraryState
        {...library}
        empty={!filtered.length}
        filtered={!!search || !!status}
      />
      {!library.loading && !library.error && !library.signedOut && (
        <div className={styles.grid}>
          {filtered.map((course) => {
            const licence = course.licence;
            const state = !licence
              ? "pending"
              : licence.isActive
                ? "active"
                : "inactive";
            return (
              <article key={course._id} className={styles.card}>
                <div className={styles.body}>
                  <div className={styles.actions}>
                    <FaKey />
                    <span className={`${styles.badge} ${styles[state]}`}>
                      {state === "active"
                        ? "لایسنس ثبت‌شده"
                        : state === "pending"
                          ? "در انتظار ثبت لایسنس"
                          : "لایسنس غیرفعال"}
                    </span>
                  </div>
                  <h2>{course.title}</h2>
                  {licence?.isActive ? (
                    <>
                      <label
                        className={styles.keyLabel}
                        htmlFor={`key-${course._id}`}
                      >
                        کلید لایسنس SpotPlayer
                      </label>
                      <textarea
                        id={`key-${course._id}`}
                        className={styles.key}
                        value={licence.key}
                        readOnly
                        spellCheck={false}
                        onFocus={(event) => event.target.select()}
                      />
                      <p>
                        آخرین به‌روزرسانی:{" "}
                        {new Date(licence.updatedAt).toLocaleDateString(
                          "fa-IR",
                        )}
                      </p>
                      <div className={styles.cardFooter}>
                        <button
                          className={styles.button}
                          onClick={() => copyKey(licence.key)}
                        >
                          <FaCopy />
                          کپی لایسنس
                        </button>
                        {licence.downloadUrl && (
                          <a
                            className={styles.secondary}
                            href={licence.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            دانلود فایل دوره
                          </a>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        {licence
                          ? "نمایش این لایسنس غیرفعال شده است. برای پیگیری با پشتیبانی تماس بگیرید."
                          : "لایسنس این دوره هنوز توسط مدیر ثبت نشده است. پس از ثبت، کلید در همین بخش نمایش داده می‌شود."}
                      </p>
                      <a
                        className={styles.secondary}
                        href={settings.telegramUrl || "/#contact"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        تماس با پشتیبانی
                      </a>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
