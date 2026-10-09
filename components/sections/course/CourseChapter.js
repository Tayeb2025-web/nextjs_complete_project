"use client";
import { useState } from "react";
import { FaLock, FaDownload } from "react-icons/fa";
import styles from "./CourseChapter.module.css";
import { useAuth } from "@/contexts/authContext";

const CourseChapter = ({ course, hasAccess = false }) => {
  const [openChapter, setOpenChapter] = useState(0); // اولین فصل باز باشه
  const {user} = useAuth();

  // چک خرید یا رایگان بودن دوره
  const isCourseFree = Boolean(course?.isFree || course?.price === 0);
  const hasPurchased =
    user &&
    user.purchasedCourses?.some(
      (purchasedCourse) => purchasedCourse === course._id,
    );

  if (!course?.chapters || course.chapters.length === 0) {
    return (
      <section className={styles.chapters} id="chapters">
        <h2 className={styles.title}>سرفصل‌های دوره</h2>
        <p className={styles.empty}>سرفصل‌هایی برای این دوره تعریف نشده است.</p>
      </section>
    );
  }

  const toggleOpenChapter = (chapterIndex) => {
    setOpenChapter(openChapter === chapterIndex ? null : chapterIndex);
  };

  return (
    <section className={styles.chapters} id="chapters">
      <div className={styles.header}>
        <h2 className={styles.title}>سرفصل‌های دوره</h2>
        <div className={styles.summary}>
          <span>{course.lessonsCount} جلسه</span>
        </div>
      </div>

      <div className={styles.accordion}>
        {course.chapters.map((chapter, chIndex) => (
          <div
            key={chIndex}
            className={`${styles.chapter} ${
              openChapter === chIndex ? styles.open : ""
            }`}
          >
            <div
              className={styles.chapterHeader}
              onClick={() => toggleOpenChapter(chIndex)}
            >
              <h3>{chapter.title}</h3>
              <span className={styles.arrow}>
                {openChapter === chIndex ? "▲" : "▼"}
              </span>
            </div>

            {openChapter === chIndex && (
              <div className={styles.lessons}>
                {chapter.lessons.map((lesson, lesIndex) => {
                  const canAccess = hasAccess || isCourseFree || hasPurchased || lesson.isFree;

                  return (
                    <div key={lesIndex} className={styles.lesson}>
                      <div className={styles.lessonInfo}>
                        {canAccess ? (
                          <a
                            href={lesson.videoUrl}
                            download
                            className={styles.lessonLink}
                          >
                            <FaDownload className={styles.downloadIcon} />
                            <span className={styles.lessonTitle}>
                              {lesson.title}
                            </span>
                          </a>
                        ) : (
                          <div className={styles.lockedLesson}>
                            <FaLock className={styles.lockIcon} />
                            <span className={styles.lessonTitle}>
                              {lesson.title}
                            </span>
                          </div>
                        )}
                      </div>

                      {canAccess && (
                        <div className={styles.lessonMeta}>
                          <span>{lesson.duration}</span>
                        </div>
                      )}

                      {!canAccess && (
                        <p className={styles.lockMessage}>
                          قفل شده — برای دسترسی دوره را خریداری کنید.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CourseChapter;
