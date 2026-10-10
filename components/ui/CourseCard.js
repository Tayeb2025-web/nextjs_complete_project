import Link from "next/link";
import styles from "./CourseCard.module.css";

import { FaUserGraduate } from "react-icons/fa6";

export default function CourseCard({course}) {
  return (
    <div className={styles.courseCard}>
      <Link href={`/course/${course.slug}`}>
        <div className={styles.courseImg}>
          <img src={course.thumbnail} />
        </div>
      </Link>
      <div className={styles.courseDetails}>
        <div className={styles.courseTitle}>
          <Link href={`/course/${course.slug}`}>
            <h2>{course.title}</h2>
          </Link>
        </div>
        <div className={styles.courseDesc}>
          توی این دوره آموزشی میخوام به زبان خیلی ساده {course.title} رو با مثال های خیلی
          زیاد و به صورت پروژه محور بهتون آموزش بدم
        </div>
        <div className="courseTeacher">سید طیب پویا</div>
      </div>
      <div className={styles.courseFooter}>
        <div className={styles.courseStudentCount}>
          <FaUserGraduate />
          <span>{course.studentsCount}</span>
        </div>
        <div className={styles.coursePrice}>

           <span>{course.isFree ? ('رایگان')
           : course.discountPrice ? (
                <div  className={styles.discountPrice}>
                  {`   ${course.discountPrice  } `}
                  <del>{course.price}</del> تومان
                </div>
           ) : (`${course.price} تومان`) }
           </span>
        </div>
      </div>

      {course.discountPrice > 0 && !course.isFree && <div className={styles.discountPercent}>{getDiscountPercent(course.price , course.discountPrice)}%</div>}
    </div>
  );
}

function getDiscountPercent(price , discountPrice) {
  return Math.round(((price - discountPrice) / price)  *100)
}