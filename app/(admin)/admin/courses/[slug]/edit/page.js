"use client";

import { useParams, useRouter } from "next/navigation";
import styles from "../../add/AddCourse.module.css";
import { RiNumbersFill } from "react-icons/ri";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import toast from "react-hot-toast";

// CKEditor دینامیک
const CKEditor = dynamic(() => import("@/components/sections/CKEditor"), {
  ssr: false,
  loading: () => <p>در حال بارگذاری ویرایشگر...</p>,
});

export default function EditCourse() {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [currentThumbnail, setCurrentThumbnail] = useState("");

  const [openChapter, setOpenChapter] = useState(0);
  const [chapters, setChapters] = useState([]);

  const { slug } = useParams();
  const router = useRouter()

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

  const editCourseHandler = async () => {
     if (!formData?.title) {
      setMessage({ text: "عنوان دوره الزامی است", type: "error" });
      return;
    }

    setMessage({ text: "", type: "" });

    const data = new FormData();
    data.append("title", formData.title);
    data.append("shortDescription", formData.shortDescription);
    data.append("fullDescription", formData.fullDescription);
    data.append("price", formData.price || "0");
    data.append("discountPrice", formData.discountPrice || "");
    data.append("isFree", formData.isFree);
    data.append("level", formData.level);
    data.append("status", formData.status);
    data.append("slug", formData.slug);
    data.append("chapters", JSON.stringify(chapters));
    if (thumbnail) data.append("thumbnail", thumbnail);

    try {
      const res = await fetch(`/api/admin/courses/${slug}`, {
        method: "PUT",
        body: data,
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ text: "دوره با موفقیت بروزرسانی شد!", type: "success" });
        toast.success("دوره با موفقیت بروزرسانی شد!");

        // اگر slug تغییر کرد، به URL جدید ریدایرکت کن
        if (result.course?.slug && result.course.slug !== slug) {
          router.push(`/admin/courses/${result.course.slug}/edit`);
        }
      } else {
        setMessage({
          text: result.message || "خطا در بروزرسانی دوره",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "خطای ارتباط با سرور", type: "error" });
    }
  }

  useEffect(() => {
    const fetchCourse = async () => {
      if (!slug) return;

      try {
        const res = await fetch(`/api/admin/courses/${slug}`);
        if (!res.ok) {
          throw new Error("دوره یافت نشد یا دسترسی ندارید");
        }

        const { course } = await res.json();

        setFormData({
          title: course.title || "",
          shortDescription: course.shortDescription || "",
          fullDescription: course.fullDescription || "",
          price: course.price || "",
          discountPrice: course.discountPrice || "",
          isFree: course.isFree || false,
          level: course.level || "beginner",
          status: course.status || "draft",
          slug: course.slug || "",
        });

        setCurrentThumbnail(course.thumbnail || "");
        setThumbnailPreview(course.thumbnail || "");

        setChapters(
          course.chapters && course.chapters.length > 0
            ? course.chapters
            : [
                {
                  title: "",
                  lessons: [
                    { title: "", duration: "", isFree: false, videoUrl: "" },
                  ],
                },
              ],
        );

        setMessage({ text: "", type: "" });
      } catch (err) {
        setMessage({
          text: err.message || "خطا در بارگذاری دوره",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.container}>
        <p>در حال بارگذاری دوره...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ایدیت کردن اطلاعات دوره </h1>

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
          onClick={editCourseHandler}
          disabled={loading}
          className={styles.submitBtn}
        >
          {loading ? "در حال ذخیره..." : "ایدیت دوره"}
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
