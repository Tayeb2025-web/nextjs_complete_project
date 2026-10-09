import Link from "next/link";
import styles from "./CourseCard.module.css";

import { FaUserGraduate } from "react-icons/fa6";
import { getCoursePrice } from "@/utils/coursePrice";

export default function CourseCard({ course }) {
  const price = getCoursePrice(course);
  const discounted = price > 0 && price < Number(course.price);
  const formatPrice = (value) => Number(value).toLocaleString("fa-IR");
  return (
    <div className={styles.courseCard}>
      <Link href={`/course/${course.slug}`}>
        <div className={styles.courseImg}>
          <img src={course.thumbnail} alt={course.title} loading="lazy" />
        </div>
      </Link>
      <div className={styles.courseDetails}>
        <div className={styles.courseTitle}>
          <Link href={`/course/${course.slug}`}>
            <h2>{course.title}</h2>
          </Link>
        </div>
        <div className={styles.courseDesc}>
          {course.shortDescription || `آموزش قدم‌به‌قدم ${course.title}`}
        </div>
        <div className="courseTeacher">سید طیب پویا</div>
      </div>
      <div className={styles.courseFooter}>
        <div className={styles.courseStudentCount}>
          <FaUserGraduate aria-hidden="true" />
          <span>
            {Number(course.studentsCount || 0).toLocaleString("fa-IR")}
          </span>
        </div>
        <div className={styles.coursePrice}>
          <span>
            {price === 0 ? (
              "رایگان"
            ) : discounted ? (
              <span className={styles.discountPrice}>
                {formatPrice(price)} <del>{formatPrice(course.price)}</del>{" "}
                تومان
              </span>
            ) : (
              `${formatPrice(price)} تومان`
            )}
          </span>
        </div>
      </div>

      {discounted && (
        <div className={styles.discountPercent}>
          {getDiscountPercent(course.price, course.discountPrice)}%
        </div>
      )}
    </div>
  );
}

function getDiscountPercent(price, discountPrice) {
  return Math.round(((price - discountPrice) / price) * 100);
}
