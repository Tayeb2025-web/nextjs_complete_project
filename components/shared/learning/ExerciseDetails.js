"use client";

import Link from "next/link";
import {
  FaArrowLeft,
  FaRegClock,
  FaCheckCircle,
  FaLightbulb,
  FaLaptopCode,
} from "react-icons/fa";
import { learningLevels, learningLanguages } from "@/utils/learningOptions";
import useExerciseProgress from "./useExerciseProgress";
import CodeBlock from "./CodeBlock";
import TopicIcon from "./TopicIcon";
import styles from "./Learning.module.css";

export default function ExerciseDetails({ exercise }) {
  const progress = useExerciseProgress();
  const completed = progress.completedIds.includes(exercise._id);
  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb} aria-label="مسیر صفحه">
        <Link href="/">صفحه اصلی</Link>
        <span>/</span>
        <Link href="/exercises">تمرین‌ها</Link>
        <span>/</span>
        <span>{exercise.title}</span>
      </nav>
      <header className={styles.detailHeader}>
        <p className={styles.kicker}>{exercise.topic}</p>
        <h1>{exercise.title}</h1>
        <p className={styles.description}>{exercise.summary}</p>
        <div className={styles.meta}>
          <span className={[styles.level, styles[exercise.level]].join(" ")}>
            {learningLevels[exercise.level]}
          </span>
          <span>
            <FaRegClock aria-hidden="true" /> حدود{" "}
            {exercise.minutes.toLocaleString("fa-IR")} دقیقه
          </span>
          <span>رایگان</span>
        </div>
      </header>
      <div className={styles.detailGrid}>
        <div className={styles.mainColumn}>
          <section className={styles.panel}>
            <h2>
              <FaLaptopCode aria-hidden="true" /> صورت تمرین
            </h2>
            <p className={styles.preserveText}>{exercise.statement}</p>
          </section>
          {exercise.examples.length > 0 && (
            <section className={styles.panel}>
              <h2>نمونه‌ها</h2>
              <div className={styles.examples}>
                {exercise.examples.map((example, index) => (
                  <div key={index} className={styles.example}>
                    <h3>نمونهٔ {(index + 1).toLocaleString("fa-IR")}</h3>
                    <span>ورودی / شرایط</span>
                    <pre dir="auto">{example.input || "—"}</pre>
                    <span>نتیجهٔ مورد انتظار</span>
                    <pre dir="auto">{example.output || "—"}</pre>
                  </div>
                ))}
              </div>
            </section>
          )}
          {exercise.starterCode && (
            <section className={styles.panel}>
              <h2>از اینجا شروع کن</h2>
              <p className={styles.muted}>
                کد را در ویرایشگر سیستم خودت قرار بده و بخش‌های لازم را تکمیل
                کن.
              </p>
              <CodeBlock
                code={exercise.starterCode}
                language={learningLanguages[exercise.codeLanguage]}
                label="کد شروع"
              />
            </section>
          )}
          {exercise.hints.length > 0 && (
            <section className={styles.panel}>
              <h2>
                <FaLightbulb aria-hidden="true" /> راهنمایی‌ها
              </h2>
              <p className={styles.muted}>
                هر راهنمایی را وقتی نیاز داشتی باز کن.
              </p>
              {exercise.hints.map((hint, index) => (
                <details className={styles.disclosure} key={index}>
                  <summary>
                    راهنمایی {(index + 1).toLocaleString("fa-IR")}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p className={styles.preserveText}>{hint}</p>
                </details>
              ))}
            </section>
          )}
          <section className={styles.panel}>
            <h2>راه‌حل پیشنهادی</h2>
            <p className={styles.muted}>
              ممکن است راه‌حل تو متفاوت و درست باشد. بعد از تلاش خودت، این نمونه
              را مقایسه کن.
            </p>
            <details className={styles.disclosure}>
              <summary>
                نمایش راه‌حل پیشنهادی<span aria-hidden="true">+</span>
              </summary>
              <div className={styles.solution}>
                <CodeBlock
                  code={exercise.solution}
                  language={learningLanguages[exercise.codeLanguage]}
                  label="راه‌حل"
                />
                {exercise.explanation && (
                  <p className={styles.preserveText}>{exercise.explanation}</p>
                )}
              </div>
            </details>
          </section>
          <Link href="/exercises" className={styles.backLink}>
            بازگشت به تمرین‌ها <FaArrowLeft aria-hidden="true" />
          </Link>
        </div>
        <aside className={styles.sidebar}>
          <section className={styles.panel}>
            <span className={styles.topicIcon}>
              <TopicIcon topic={exercise.topic} />
            </span>
            <h2>قدم‌های این تمرین</h2>
            <ol className={styles.steps}>
              <li>صورت تمرین و نمونه‌ها را بخوان.</li>
              <li>کد را روی سیستم خودت بنویس.</li>
              <li>نتیجه را با نمونه‌ها مقایسه کن.</li>
              <li>راه‌حل را مرور و وضعیتت را ثبت کن.</li>
            </ol>
            <p className={styles.muted}>
              «انجام‌شده» گزارش خودت از پیشرفت است.
            </p>
            {progress.authLoading ? (
              <p role="status" className={styles.muted}>
                در حال بررسی حساب...
              </p>
            ) : progress.user ? (
              <>
                {progress.error && (
                  <div className={styles.notice}>
                    <p role="alert">{progress.error}</p>
                    <button
                      className={styles.smallButton}
                      onClick={progress.retry}
                    >
                      تلاش دوباره
                    </button>
                  </div>
                )}
                <button
                  className={completed ? styles.completedButton : styles.button}
                  disabled={
                    progress.loading || !!progress.error || !!progress.savingId
                  }
                  onClick={() => progress.save(exercise._id, !completed)}
                >
                  {progress.loading ? (
                    "در حال دریافت وضعیت..."
                  ) : progress.savingId ? (
                    "در حال ذخیره..."
                  ) : completed ? (
                    <>
                      <FaCheckCircle aria-hidden="true" /> انجام داده‌ام؛ لغو
                      وضعیت
                    </>
                  ) : (
                    "این تمرین را انجام دادم"
                  )}
                </button>
              </>
            ) : (
              <Link className={styles.button} href="/auth">
                ورود برای ثبت پیشرفت
              </Link>
            )}
          </section>
          {exercise.relatedCourse && (
            <section className={styles.related}>
              <p className={styles.kicker}>مرور آموزش</p>
              <h2>{exercise.relatedCourse.title}</h2>
              <p>
                اگر به مرور مفاهیم این تمرین نیاز داری، دورهٔ مرتبط را ببین.
              </p>
              <Link href={"/course/" + exercise.relatedCourse.slug}>
                مشاهدهٔ دوره <FaArrowLeft aria-hidden="true" />
              </Link>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
