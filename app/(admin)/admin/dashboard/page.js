"use client";

import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import Link from "next/link";
import { FaUsers, FaShoppingCart, FaComments, FaChartLine } from "react-icons/fa";
import { SiCoursera } from "react-icons/si";
import { MdToday, MdCalendarMonth, MdQuestionAnswer } from "react-icons/md";
import { IoMdTime } from "react-icons/io";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error();

        const result = await res.json();
        if (result.success) {
          setData(result);
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatPrice = (price) => {
    return Number(price).toLocaleString("fa-IR");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusMap = {
    pending: "در انتظار",
    paid: "پرداخت شده",
    failed: "ناموفق",
    cancelled: "لغو شده",
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerRight}>
            <h1>داشبورد مدیریت</h1>
            <p>در حال بارگذاری اطلاعات...</p>
          </div>
        </div>

        {/* Skeleton Loading */}
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
        </div>
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
        </div>
        <div className={styles.skeletonLarge}></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <p>خطا در بارگذاری داشبورد</p>
      </div>
    );
  }

  const { stats, charts, recentComments, recentOrders } = data;

  // پیدا کردن بیشترین فروش برای مقیاس نمودار
  const maxSales = Math.max(...charts.last7Days.map((d) => d.sales), 1);

  return (
    <div className={styles.container}>
      {/* ===== Header ===== */}
      <div className={styles.header}>
        <div className={styles.headerRight}>
          <h1>داشبورد مدیریت</h1>
          <p>خلاصه وضعیت سایت و آمار فروش</p>
        </div>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.headerBtn}>
            مشاهده سایت
          </Link>
        </div>
      </div>

      {/* ===== Stat Cards (کل آمار) ===== */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <FaUsers />
          </div>
          <div className={styles.statInfo}>
            <h3>{formatPrice(stats.totalUsers)}</h3>
            <p>کل کاربران</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <SiCoursera />
          </div>
          <div className={styles.statInfo}>
            <h3>{formatPrice(stats.totalCourses)}</h3>
            <p>کل دوره‌ها</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}>
            <FaShoppingCart />
          </div>
          <div className={styles.statInfo}>
            <h3>{formatPrice(stats.totalOrders)}</h3>
            <p>کل سفارشات</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <FaComments />
          </div>
          <div className={styles.statInfo}>
            <h3>{formatPrice(stats.totalComments)}</h3>
            <p>کل نظرات</p>
          </div>
        </div>
      </div>

      {/* ===== Sales Cards (فروش) ===== */}
      <div className={styles.salesGrid}>
        <div className={styles.salesCard}>
          <div className={styles.salesCardHeader}>
            <p>فروش امروز</p>
            <span className={`${styles.salesBadge} ${styles.today}`}>
              <MdToday style={{ verticalAlign: "middle" }} /> امروز
            </span>
          </div>
          <div className={styles.salesAmount}>
            {formatPrice(stats.todaySales)} <span>تومان</span>
          </div>
          <p className={styles.salesOrders}>
            {formatPrice(stats.todayOrdersCount)} سفارش موفق
          </p>
        </div>

        <div className={styles.salesCard}>
          <div className={styles.salesCardHeader}>
            <p>فروش این ماه</p>
            <span className={`${styles.salesBadge} ${styles.thisMonth}`}>
              <MdCalendarMonth style={{ verticalAlign: "middle" }} /> ماه جاری
            </span>
          </div>
          <div className={styles.salesAmount}>
            {formatPrice(stats.thisMonthSales)} <span>تومان</span>
          </div>
          <p className={styles.salesOrders}>
            {formatPrice(stats.thisMonthOrdersCount)} سفارش موفق
          </p>
        </div>

        <div className={styles.salesCard}>
          <div className={styles.salesCardHeader}>
            <p>فروش ماه قبل</p>
            <span className={`${styles.salesBadge} ${styles.lastMonth}`}>
              <IoMdTime style={{ verticalAlign: "middle" }} /> ماه گذشته
            </span>
          </div>
          <div className={styles.salesAmount}>
            {formatPrice(stats.lastMonthSales)} <span>تومان</span>
          </div>
          <p className={styles.salesOrders}>
            {formatPrice(stats.lastMonthOrdersCount)} سفارش موفق
          </p>
        </div>
      </div>

      {/* ===== Chart + Quick Stats ===== */}
      <div className={styles.mainGrid}>
        {/* نمودار فروش 7 روز اخیر */}
        <div className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <h2>
              <FaChartLine
                style={{ marginLeft: "8px", verticalAlign: "middle" }}
              />
              نمودار فروش ۷ روز اخیر
            </h2>
          </div>
          <div className={styles.chartContainer}>
            {charts.last7Days.map((day, index) => (
              <div key={index} className={styles.chartBar}>
                <span className={styles.chartBarValue}>
                  {day.sales > 0 ? formatPrice(day.sales) : ""}
                </span>
                <div
                  className={styles.chartBarFill}
                  style={{
                    height: `${(day.sales / maxSales) * 160}px`,
                  }}
                ></div>
                <span className={styles.chartBarLabel}>{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* آمار سریع */}
        <div className={styles.quickStats}>
          <div className={styles.quickStatCard}>
            <div
              className={styles.quickStatIcon}
              style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}
            >
              <MdQuestionAnswer />
            </div>
            <div className={styles.quickStatInfo}>
              <h4>{formatPrice(stats.unansweredComments)}</h4>
              <p>کامنت بدون پاسخ</p>
            </div>
          </div>

          <div className={styles.quickStatCard}>
            <div
              className={styles.quickStatIcon}
              style={{ backgroundColor: "#dbeafe", color: "#3b82f6" }}
            >
              <FaUsers />
            </div>
            <div className={styles.quickStatInfo}>
              <h4>{formatPrice(stats.totalUsers)}</h4>
              <p>کل کاربران ثبت‌نام شده</p>
            </div>
          </div>

          <div className={styles.quickStatCard}>
            <div
              className={styles.quickStatIcon}
              style={{ backgroundColor: "#d1fae5", color: "#10b981" }}
            >
              <FaShoppingCart />
            </div>
            <div className={styles.quickStatInfo}>
              <h4>{formatPrice(stats.todayOrdersCount)}</h4>
              <p>سفارش امروز</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Recent Comments + Orders ===== */}
      <div className={styles.bottomGrid}>
        {/* آخرین کامنت‌ها */}
        <div className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <h2>آخرین نظرات</h2>
            <Link href="/admin/comments" className={styles.viewAllLink}>
              مشاهده همه
            </Link>
          </div>

          {recentComments.length === 0 ? (
            <p className={styles.emptyList}>هیچ نظری ثبت نشده</p>
          ) : (
            recentComments.map((comment) => (
              <div key={comment._id} className={styles.commentItem}>
                <div className={styles.commentAvatar}>
                  {comment.user?.name?.[0] || "ک"}
                </div>
                <div className={styles.commentContent}>
                  <div className={styles.commentMeta}>
                    <span className={styles.commentUser}>
                      {comment.user?.name || "ناشناس"}
                      <span
                        className={`${styles.statusDot} ${
                          comment.isApproved ? styles.approved : styles.pending
                        }`}
                      ></span>
                    </span>
                    <span className={styles.commentDate}>
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className={styles.commentText}>
                    {comment.text.length > 60
                      ? `${comment.text.substring(0, 60)}...`
                      : comment.text}
                  </p>
                  {comment.course && (
                    <p className={styles.commentCourse}>
                      دوره: {comment.course.title}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* آخرین سفارشات */}
        <div className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <h2>آخرین سفارشات</h2>
            <Link href="/admin/orders" className={styles.viewAllLink}>
              مشاهده همه
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className={styles.emptyList}>هیچ سفارشی ثبت نشده</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order._id} className={styles.orderItem}>
                <div className={styles.orderInfo}>
                  <span className={styles.orderUser}>
                    {order.user?.name || "کاربر"}
                  </span>
                  <span className={styles.orderDate}>
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className={styles.orderRight}>
                  <span className={styles.orderAmount}>
                    {formatPrice(order.totalPrice)} تومان
                  </span>
                  <span
                    className={`${styles.orderStatus} ${
                      styles[order.status]
                    }`}
                  >
                    {statusMap[order.status] || order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
