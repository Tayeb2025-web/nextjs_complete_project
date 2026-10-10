"use client";
import styles from "./Learning.module.css";
export default function LearningError({ retry }) {
  return (
    <div className={styles.container}>
      <div className={styles.state}>
        <h1>بارگذاری صفحه انجام نشد</h1>
        <p role="alert">دریافت محتوا با خطا روبه‌رو شد. دوباره تلاش کنید.</p>
        <button className={styles.button} onClick={retry}>
          تلاش دوباره
        </button>
      </div>
    </div>
  );
}
