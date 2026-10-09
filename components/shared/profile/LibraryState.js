import Link from "next/link";
import { FaBookOpen } from "react-icons/fa";
import styles from "./Library.module.css";

export default function LibraryState({
  loading,
  signedOut,
  error,
  reload,
  empty,
  filtered = false,
}) {
  if (loading)
    return (
      <div
        className={styles.grid}
        role="status"
        aria-label="در حال بارگذاری اطلاعات"
      >
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
      </div>
    );
  if (signedOut)
    return (
      <div className={styles.empty}>
        <h2>ابتدا وارد حساب خود شوید</h2>
        <p>برای مشاهدهٔ دوره‌ها و لایسنس‌ها به حساب کاربری وارد شوید.</p>
        <Link className={styles.button} href="/auth">
          ورود به حساب
        </Link>
      </div>
    );
  if (error)
    return (
      <div className={styles.empty}>
        <p role="alert" className={`${styles.message} ${styles.error}`}>
          {error}
        </p>
        <button className={styles.button} onClick={reload}>
          تلاش دوباره
        </button>
        <Link className={styles.secondary} href="/auth">
          ورود به حساب
        </Link>
      </div>
    );
  if (empty)
    return (
      <div className={styles.empty}>
        <FaBookOpen />
        <h2>
          {filtered
            ? "نتیجه‌ای پیدا نشد"
            : "هنوز دوره‌ای در حساب شما ثبت نشده است"}
        </h2>
        <p>
          {filtered
            ? "عبارت جستجو یا فیلتر را تغییر دهید."
            : "پس از ثبت خرید موفق، دوره‌های شما در این بخش نمایش داده می‌شوند."}
        </p>
        {!filtered && (
          <Link className={styles.button} href="/courses">
            مشاهدهٔ دوره‌ها
          </Link>
        )}
      </div>
    );
  return null;
}
