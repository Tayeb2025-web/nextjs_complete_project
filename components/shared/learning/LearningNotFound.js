import Link from "next/link";
import styles from "./Learning.module.css";
export default function LearningNotFound({ type }) {
  return (
    <div className={styles.container}>
      <div className={styles.state}>
        <h1>{type === "exercise" ? "تمرین یافت نشد" : "مقاله یافت نشد"}</h1>
        <p>ممکن است آدرس تغییر کرده باشد یا این محتوا هنوز منتشر نشده باشد.</p>
        <Link
          className={styles.button}
          href={type === "exercise" ? "/exercises" : "/articles"}
        >
          بازگشت به فهرست
        </Link>
      </div>
    </div>
  );
}
