"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaLaptopCode,
  FaBookOpen,
  FaRegClock,
  FaSearch,
} from "react-icons/fa";
import AdminPagination from "@/components/shared/admin/AdminPagination";
import { learningLevels } from "@/utils/learningOptions";
import useExerciseProgress from "./useExerciseProgress";
import TopicIcon from "./TopicIcon";
import styles from "./Learning.module.css";

export default function LearningCatalog({ type }) {
  const exercise = type === "exercise";
  const base = exercise ? "exercises" : "articles";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [completion, setCompletion] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const progress = useExerciseProgress(exercise);
  useEffect(() => {
    const controller = new AbortController();
    let timeout = false;
    const timer = setTimeout(() => {
      timeout = true;
      controller.abort();
    }, 15000);
    setLoading(true);
    setError("");
    (async () => {
      try {
        const res = await fetch("/api/" + base, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "خطا در دریافت محتوا");
        if (!controller.signal.aborted) setItems(data.items);
      } catch (err) {
        if (!controller.signal.aborted || timeout)
          setError(
            timeout
              ? "بارگذاری طول کشید؛ دوباره تلاش کنید."
              : "خطا در دریافت محتوا؛ دوباره تلاش کنید.",
          );
      } finally {
        clearTimeout(timer);
        if (!controller.signal.aborted || timeout) setLoading(false);
      }
    })();
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [base, retry]);

  const completed = new Set(progress.completedIds);
  const topics = [...new Set(items.map((item) => item.topic))].sort((a, b) =>
    a.localeCompare(b, "fa"),
  );
  const visibleItems = items.filter(
    (item) =>
      (item.title + " " + item.summary + " " + item.topic)
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (!topic || item.topic === topic) &&
      (!exercise || !level || item.level === level) &&
      (!exercise ||
        !progress.user ||
        completion === "all" ||
        completed.has(item._id) === (completion === "completed")),
  );
  if (sort === "shortest") visibleItems.sort((a, b) => a.minutes - b.minutes);
  if (sort === "level")
    visibleItems.sort(
      (a, b) =>
        ["beginner", "intermediate", "advanced"].indexOf(a.level) -
        ["beginner", "intermediate", "advanced"].indexOf(b.level),
    );
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / 9));
  const currentPage = Math.min(page, totalPages);
  const visible = visibleItems.slice((currentPage - 1) * 9, currentPage * 9);
  const filter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  return (
    <div className={styles.container}>
      <section className={styles.intro}>
        <div>
          <p className={styles.kicker}>
            {exercise
              ? "یادگیری را به عمل تبدیل کن"
              : "بخوان، یاد بگیر، بهتر کد بزن"}
          </p>
          <h1>{exercise ? "تمرین‌های برنامه‌نویسی" : "مقالات آموزشی"}</h1>
          <p className={styles.description}>
            {exercise
              ? "یک تمرین انتخاب کن، کد را روی سیستم خودت بنویس و نتیجه را بررسی کن. هرجا نیاز داشتی، از راهنمایی‌ها کمک بگیر."
              : "آموزش‌های متنی برای درک مفاهیم، حل مسئله و ادامهٔ مسیر برنامه‌نویسی؛ در کنار دوره‌ها و تمرین‌ها."}
          </p>
          <div className={styles.introLinks}>
            <Link href={exercise ? "/courses" : "/exercises"}>
              {exercise ? "مرور دوره‌های آموزشی" : "وقت تمرین است"}{" "}
              <FaArrowLeft aria-hidden="true" />
            </Link>
            <span>
              {exercise ? "تمرین‌ها رایگان‌اند" : "مطالعهٔ مقالات رایگان است"}
            </span>
          </div>
        </div>
        <div className={styles.introStat}>
          {exercise ? (
            <FaLaptopCode aria-hidden="true" />
          ) : (
            <FaBookOpen aria-hidden="true" />
          )}
          <strong>
            {loading ? "…" : error ? "—" : items.length.toLocaleString("fa-IR")}
          </strong>
          <span>{exercise ? "تمرین برای یادگیری" : "مقاله برای مطالعه"}</span>
        </div>
      </section>
      {exercise && progress.user && (
        <div className={styles.progressBanner}>
          <FaCheckCircle aria-hidden="true" />
          <p>
            {progress.loading
              ? "در حال دریافت وضعیت تمرین‌های شما..."
              : progress.error
                ? progress.error
                : "از " +
                  items.length.toLocaleString("fa-IR") +
                  " تمرین، " +
                  items
                    .filter((i) => completed.has(i._id))
                    .length.toLocaleString("fa-IR") +
                  " تمرین را انجام داده‌ای."}
          </p>
          {progress.error && (
            <button onClick={progress.retry} className={styles.smallButton}>
              تلاش دوباره
            </button>
          )}
        </div>
      )}
      <div className={styles.filters}>
        <div className={styles.search}>
          <FaSearch aria-hidden="true" />
          <input
            aria-label="جستجوی عنوان یا موضوع"
            placeholder="عنوان یا موضوع را جستجو کن..."
            value={search}
            onChange={filter(setSearch)}
          />
        </div>
        <select aria-label="موضوع" value={topic} onChange={filter(setTopic)}>
          <option value="">همهٔ موضوع‌ها</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {exercise && (
          <select
            aria-label="سطح تمرین"
            value={level}
            onChange={filter(setLevel)}
          >
            <option value="">همهٔ سطح‌ها</option>
            {Object.entries(learningLevels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        )}
        {exercise && progress.user && (
          <select
            aria-label="وضعیت انجام"
            disabled={progress.loading || !!progress.error}
            value={completion}
            onChange={filter(setCompletion)}
          >
            <option value="all">همهٔ تمرین‌ها</option>
            <option value="todo">انجام‌نشده</option>
            <option value="completed">انجام‌شده</option>
          </select>
        )}
        <select aria-label="مرتب‌سازی" value={sort} onChange={filter(setSort)}>
          <option value="newest">جدیدترین</option>
          <option value="shortest">
            {exercise ? "زمان کمتر" : "مطالعهٔ کوتاه‌تر"}
          </option>
          {exercise && <option value="level">از ساده به پیشرفته</option>}
        </select>
      </div>
      {loading ? (
        <div className={styles.state} role="status">
          در حال بارگذاری {exercise ? "تمرین‌ها" : "مقالات"}...
        </div>
      ) : error ? (
        <div className={styles.state}>
          <p role="alert">{error}</p>
          <button
            className={styles.button}
            onClick={() => setRetry((v) => v + 1)}
          >
            تلاش دوباره
          </button>
        </div>
      ) : visible.length ? (
        <>
          <p className={styles.results}>
            {visibleItems.length.toLocaleString("fa-IR")}{" "}
            {exercise ? "تمرین" : "مقاله"}
          </p>
          <div className={styles.cardGrid}>
            {visible.map((item) => (
              <Link
                key={item._id}
                href={"/" + base + "/" + item.slug}
                className={styles.card}
              >
                <div className={styles.cardTop}>
                  <span className={styles.topicIcon}>
                    <TopicIcon topic={item.topic} />
                  </span>
                  <span className={styles.topic}>{item.topic}</span>
                  {exercise && completed.has(item._id) && (
                    <span className={styles.done}>
                      <FaCheckCircle aria-hidden="true" /> انجام‌شده
                    </span>
                  )}
                </div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <div className={styles.cardMeta}>
                  {exercise && (
                    <span
                      className={[styles.level, styles[item.level]].join(" ")}
                    >
                      {learningLevels[item.level]}
                    </span>
                  )}
                  <span>
                    <FaRegClock aria-hidden="true" />{" "}
                    {item.minutes.toLocaleString("fa-IR")} دقیقه
                    {!exercise && " مطالعه"}
                  </span>
                </div>
                <div className={styles.cardFooter}>
                  <span>{exercise ? "شروع تمرین" : "مطالعهٔ مقاله"}</span>
                  <FaArrowLeft aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
          <AdminPagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setPage}
          />
        </>
      ) : (
        <div className={styles.state}>
          <FaSearch aria-hidden="true" />
          <h2>
            {items.length
              ? "نتیجه‌ای پیدا نشد"
              : exercise
                ? "تمرین‌ها به‌زودی اضافه می‌شوند"
                : "مقالات به‌زودی اضافه می‌شوند"}
          </h2>
          <p>
            {items.length
              ? "موضوع، سطح یا متن جستجو را تغییر بده."
              : "برای شروع یادگیری، دوره‌های آموزشی را ببین."}
          </p>
          {items.length ? (
            <button
              className={styles.button}
              onClick={() => {
                setSearch("");
                setTopic("");
                setLevel("");
                setCompletion("all");
                setPage(1);
              }}
            >
              پاک کردن فیلترها
            </button>
          ) : (
            <Link className={styles.button} href="/courses">
              مشاهدهٔ دوره‌ها
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
