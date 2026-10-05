"use client";

import { useState } from "react";
import Link from "next/link";
import { FaCartShopping } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import styles from "./CourseIntro.module.css";
import { useCart } from "@/contexts/cartContext";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";

export default function CourseIntro({
  course,
  totalDuration,
  totalLessons,
  statusText,
  levelText,
}) {

  const {cart , addToCart} = useCart();
  const {user} = useAuth()
  const [loading, setLoading] = useState(false);

  const isFree = Boolean(course.isFree || course.price === 0);
  const hasPurchased = user && user.purchasedCourses?.some(purchasedCourse => purchasedCourse === course._id );
  const hasDiscount = Boolean(!isFree && course.discountPrice && course.discountPrice > 0 && course.discountPrice < course.price);
  const finalPrice = hasDiscount ? course.discountPrice : course.price;
  const isCourseInCart = cart.some((courseInCart) => courseInCart._id === course._id);


  const addToCartHandler = () => {
    if (isFree) {
      const chaptersEl = document.getElementById("chapters");
      if (chaptersEl) {
        chaptersEl.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    if (!user) {
      return toast.error("ابتدا باید لاگین کنی");
    }
    addToCart(course);
    toast.success("دوره به سبد خرید اضافه شد!");
  };


  return (
    <div className={styles.courseIntro}>
      {/* بخش بالا: اطلاعات + عکس */}
      <div className={styles.courseTop}>
        <div className={styles.courseInfo}>
          <h1 className={styles.courseTitle}>{course.title}</h1>

          <p className={styles.courseDesc}>
            {course.shortDescription ||
              "توضیحات کوتاهی برای این دوره در دسترس نیست."}
          </p>

          <div className={styles.coursePayment}>
            {hasPurchased ? (
              <div className={styles.purchasedBox}>
                <FaCheckCircle size="28px" color="#10b981" />
                <span>شما در این دوره ثبت‌ نام کرده‌اید</span>
                <Link
                  href={`/learn/${course.slug}`}
                  className={styles.startLearningBtn}
                >
                  شروع یادگیری
                </Link>
              </div>
            ) : (
              <button
                onClick={addToCartHandler}
                disabled={loading}
                className={isFree ? styles.freeEnrollBtn : styles.enrollBtn}
              >
                <FaCartShopping size="22px" />
                <span>
                  {loading
                    ? "در حال پردازش..."
                    : isFree
                      ? "دسترسی رایگان به همه جلسات"
                      : isCourseInCart
                        ? "به سبد خرید اضافه شده"
                        : "ثبت نام در دوره"}
                </span>
              </button>
            )}

            {!isFree && !hasPurchased && (
              <div className={styles.priceBox}>
                {hasDiscount && (
                  <del className={styles.originalPrice}>
                    {course.price?.toLocaleString()} تومان
                  </del>
                )}
                <p className={styles.finalPrice}>
                  <span>{finalPrice?.toLocaleString()}</span>
                  <span> تومان</span>
                </p>
              </div>
            )}

            {isFree && !hasPurchased && (
              <div className={styles.priceBox}>
                <p className={styles.finalPrice} style={{ color: "#10b981" }}>
                  <span>رایگان</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {course.thumbnail && (
          <div className={styles.courseThumbnail}>
            <img src={course.thumbnail} alt={course.title} />
          </div>
        )}
      </div>

      {/* بخش پایین: جزئیات دوره بصورت افقی */}
      <div className={styles.courseMeta}>
        <MetaItem label="وضعیت دوره" value={statusText} />
        <MetaItem label="سطح" value={levelText} />
        <MetaItem label="مدت زمان" value={totalDuration} />
        <MetaItem label="تعداد جلسات" value={`${totalLessons} جلسه`} />
        <MetaItem label="روش پشتیبانی" value="تیکت و پرسش و پاسخ" />
        <MetaItem label="پیش‌نیاز" value="ندارد" />
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className={styles.courseDetailBox}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  );
}