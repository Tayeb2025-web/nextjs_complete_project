"use client";

import { useState } from "react";
import styles from "./AddCourse.module.css";
import dynamic from "next/dynamic";
import Image from "next/image";
import toast from "react-hot-toast";
import CourseCategorySelect from "@/components/shared/admin/CourseCategorySelect";

// CKEditor دینامیک
const CKEditor = dynamic(() => import("@/components/sections/CKEditor"), {
  ssr: false,
  loading: () => <p>در حال بارگذاری ویرایشگر...</p>,
});

export default function AddCourse() {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    fullDescription: "<p>توضیحات کامل دوره را اینجا بنویسید...</p>",
    price: "",
    discountPrice: "",
    category: "",
    isFree: false,
    level: "beginner",
    status: "draft",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [openChapter, setOpenChapter] = useState(0);
  const [chapters, setChapters] = useState([
    {
      title: "",
      lessons: [{ title: "", duration: "", isFree: false, videoUrl: "" }],
    },
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    console.log(URL.createObjectURL(file));

    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const addCourseHandler = async () => {
    // validation ساده
    if (!formData.title.trim())
      return setMessage({ text: "عنوان دوره الزامی است", type: "error" });
    if (!thumbnail)
      return setMessage({ text: "تصویر کاور الزامی است", type: "error" });
    if (!formData.price && !formData.isFree)
      return setMessage({
        text: "قیمت یا رایگان بودن را مشخص کنید",
        type: "error",
      });

    setLoading(true);
    setMessage({ text: "", type: "" });

    const data = new FormData();
    data.append("title", formData.title);
    data.append("slug", formData.slug);
    data.append("shortDescription", formData.shortDescription);
    data.append("fullDescription", formData.fullDescription);
    data.append("price", formData.price || 0);
    data.append("discountPrice", formData.discountPrice || "");
    data.append("category", formData.category);
    data.append("isFree", formData.isFree);
    data.append("level", formData.level);
    data.append("status", formData.status);
    if (thumbnail) data.append("thumbnail", thumbnail);
    data.append("chapters", JSON.stringify(chapters));

    try {
      const res = await fetch("/api/admin/courses/add", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      console.log(result);

      if (result.success) {
        toast.success("دوره با موفقیت اضافه شد");
        setFormData({
          title: "",
          slug: "",
          shortDescription: "",
          fullDescription: "<p>توضیحات کامل دوره را اینجا بنویسید...</p>",
          price: "",
          discountPrice: "",
          category: "",
          isFree: false,
          level: "beginner",
          status: "draft",
          slug: "",
        });

        setThumbnail(null);
        setThumbnailPreview(null);

        setChapters([
          {
            title: "",
            lessons: [{ title: "", duration: "", isFree: false, videoUrl: "" }],
          },
        ]);
        
      } else {
        toast.error(result.message || "خطا در ذخیره دوره");
      }
    } catch (error) {
      toast.error("خطای سرور");
    } finally {
      setLoading(false);
    }
  };

  const updateChapterTitle = (index, field, value) => {
    setChapters((prev) =>
      prev.map((chapter, i) =>
        i === index ? { ...chapter, [field]: value } : chapter,
      ),
    );
  };

  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        title: "",
        lessons: [{ title: "", duration: "", isFree: false, videoUrl: "" }],
      },
    ]);
  };

  const removeChapter = (index) => {
    if (chapters.length > 1) {
      setChapters((prev) => prev.filter((chapter, i) => i !== index));
    }
  };

  const updateLesson = (chapterIndex, lessonIndex, field, value) => {
    setChapters((prev) =>
      prev.map((ch, i) =>
        i === chapterIndex
          ? {
              ...ch,
              lessons: ch.lessons.map((les, li) =>
                li === lessonIndex ? { ...les, [field]: value } : les,
              ),
            }
          : ch,
      ),
    );
  };

  const addLesson = (chapterIndex) => {
    setChapters((prev) =>
      prev.map((ch, i) =>
        i === chapterIndex
          ? {
              ...ch,
              lessons: [
                ...ch.lessons,
                { title: "", duration: "", isFree: false, videoUrl: "" },
              ],
            }
          : ch,
      ),
    );
  };

  const removeLesson = (chapterIndex, lessonIndex) => {
    setChapters((prev) =>
      prev.map((ch, i) =>
        i === chapterIndex
          ? {
              ...ch,
              lessons: ch.lessons.filter((lesson, li) => li !== lessonIndex),
            }
          : ch,
      ),
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>اضافه کردن دوره جدید</h1>

      <form className={styles.form}>
        {/* عنوان */}
        <div className={styles.field}>
          <label>عنوان دوره *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="مثال: آموزش کامل React از صفر تا صد"
            required
          />
        </div>

        <div className={styles.field}>
          <label>آدرس URL دوره (slug)</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="مثال: react-js-complete-guide"
            dir="ltr"
            style={{ textAlign: "left", direction: "ltr" }}
          />
        </div>

        <div className={styles.field}>
          <CourseCategorySelect value={formData.category} onChange={(category) => setFormData((previous) => ({ ...previous, category }))} />
        </div>

        {/* توضیح کوتاه */}
        <div className={styles.field}>
          <label>توضیح کوتاه (حداکثر 300 کاراکتر)</label>
          <textarea
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            rows="3"
            maxLength="300"
            placeholder="خلاصه‌ای از دوره برای نمایش در کارت دوره"
          />
        </div>

        {/* توضیح کامل با CKEditor */}
        <div className={styles.field}>
          <label>توضیحات کامل دوره *</label>
          <CKEditor
            data={formData.fullDescription}
            onChange={(data) =>
              setFormData((prev) => ({ ...prev, fullDescription: data }))
            }
          />
        </div>

        {/* قیمت و تخفیف */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label>قیمت (تومان)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              disabled={formData.isFree}
              min="0"
            />
          </div>

          <div className={styles.field}>
            <label>قیمت با تخفیف</label>
            <input
              type="number"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleChange}
              disabled={formData.isFree}
              min="0"
            />
          </div>

          <div className={styles.checkboxField}>
            <label>
              <input
                type="checkbox"
                name="isFree"
                onChange={handleChange}
                checked={formData.isFree}
              />
              <span>دوره رایگان</span>
            </label>
          </div>
        </div>

        {/* سطح و وضعیت */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label>سطح دوره</label>
            <select name="level" onChange={handleChange} value={formData.level}>
              <option value="beginner">مبتدی</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">پیشرفته</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>وضعیت انتشار</label>
            <select
              name="status"
              onChange={handleChange}
              value={formData.status}
            >
              <option value="draft">پیش‌نویس</option>
              <option value="published">منتشر شده</option>
              <option value="coming-soon">به زودی</option>
            </select>
          </div>
        </div>

        {/* تصویر کاور */}
        <div className={styles.field}>
          <label>تصویر کاور دوره *</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={handleThumbnailChange}
          />
          {thumbnailPreview && (
            <div className={styles.preview}>
              <Image
                src={thumbnailPreview}
                alt="پیش‌نمایش"
                width={300}
                height={200}
                className={styles.thumbnail}
              />
            </div>
          )}
        </div>

        {/* فصل‌ها و درس‌ها — به صورت آکاردئون */}
        <div className={styles.chaptersSection}>
          <h3 className={styles.chaptersTitle}>فصل‌ها و درس‌ها</h3>

          <div className={styles.accordion}>
            {chapters.map((chapter, chIndex) => (
              <div
                key={chIndex}
                className={`${styles.chapterItem} ${
                  openChapter === chIndex ? styles.open : ""
                }`}
              >
                <div
                  className={styles.chapterHeader}
                  onClick={() =>
                    setOpenChapter(openChapter === chIndex ? null : chIndex)
                  }
                >
                  <div className={styles.chapterTitleWrapper}>
                    <span className={styles.chapterIndex}>
                      فصل {chIndex + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="عنوان فصل را وارد کنید"
                      value={chapter.title || ""}
                      onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن آکاردئون موقع تایپ
                      onChange={(e) =>
                        updateChapterTitle(chIndex, "title", e.target.value)
                      }
                      className={styles.chapterTitleInput}
                    />
                  </div>

                  <div className={styles.chapterActions}>
                    <span className={styles.lessonCount}>
                      {chapter.lessons.length} درس
                    </span>

                    {chapters.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeChapterBtn}
                        onClick={() => removeChapter(chIndex)}
                      >
                        حذف فصل
                      </button>
                    )}

                    <span className={styles.arrow}>
                      {openChapter === chIndex ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* محتوای فصل — فقط وقتی باز باشه */}
                {openChapter === chIndex && (
                  <div className={styles.chapterContent}>
                    {chapter.lessons.map((lesson, lesIndex) => (
                      <div key={lesIndex} className={styles.lessonItem}>
                        <div className={styles.rowOne}>
                          <input
                            type="text"
                            placeholder="عنوان درس"
                            value={lesson.title || ""}
                            className={styles.lessonTitle}
                            onChange={(e) =>
                              updateLesson(
                                chIndex,
                                lesIndex,
                                "title",
                                e.target.value,
                              )
                            }
                          />

                          <input
                            type="text"
                            placeholder="مدت زمان (مثال: 12:30)"
                            value={lesson.duration || ""}
                            className={styles.lessonDuration}
                            onChange={(e) =>
                              updateLesson(
                                chIndex,
                                lesIndex,
                                "duration",
                                e.target.value,
                              )
                            }
                          />
                          <label className={styles.freeLessonLabel}>
                            <input
                              type="checkbox"
                              checked={lesson.isFree || false}
                              onChange={(e) =>
                                updateLesson(
                                  chIndex,
                                  lesIndex,
                                  "isFree",
                                  e.target.checked,
                                )
                              }
                            />
                            <span> رایگان</span>
                          </label>
                        </div>

                        <input
                          type="text"
                          placeholder="آدرس ویدئو"
                          value={lesson.videoUrl || ""}
                          className={styles.lessonVideoUrl}
                          onChange={(e) =>
                            updateLesson(
                              chIndex,
                              lesIndex,
                              "videoUrl",
                              e.target.value,
                            )
                          }
                        />

                        {chapter.lessons.length > 1 && (
                          <button
                            type="button"
                            className={styles.removeLessonBtn}
                            onClick={() => removeLesson(chIndex, lesIndex)}
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      className={styles.addLessonBtn}
                      onClick={() => addLesson(chIndex)}
                    >
                      + اضافه کردن درس جدید
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            className={styles.addChapterBtn}
            onClick={addChapter}
          >
            + اضافه کردن فصل جدید
          </button>
        </div>

        {/* دکمه ارسال */}
        <button
          type="button"
          onClick={addCourseHandler}
          disabled={loading}
          className={styles.submitBtn}
        >
          {loading ? "در حال ذخیره..." : "ذخیره دوره"}
        </button>

        {message.text && (
          <p className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}
