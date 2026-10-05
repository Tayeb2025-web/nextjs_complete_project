"use client";

import { useEffect, useState } from "react";
import styles from "./Profile.module.css";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import { FaShoppingCart, FaComments, FaEdit } from "react-icons/fa";
import { SiCoursera } from "react-icons/si";
import { MdPayment, MdCalendarToday } from "react-icons/md";
import Link from "next/link";

export default function Profile() {
  const { user: authUser, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error();

        const data = await res.json();
        if (data.success) {
          setProfileData(data);
          setFormData({
            name: data.user.name || "",
            phone: data.user.phone || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("نام نمی‌تواند خالی باشد");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("اطلاعات با موفقیت بروزرسانی شد");
        refreshUser();
      } else {
        toast.error("خطا در بروزرسانی اطلاعات");
      }
    } catch (err) {
      toast.error("خطای سرور");
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString("fa-IR");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
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
          <div className={styles.headerTitle}>
            <h1>پروفایل من</h1>
            <p>در حال بارگذاری...</p>
          </div>
        </div>
        <div className={styles.skeletonLarge}></div>
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className={styles.container}>
        <p>خطا در بارگذاری پروفایل</p>
      </div>
    );
  }

  const { user, stats, recentOrders } = profileData;

  return (
    <div className={styles.container}>
      {/* ===== Header ===== */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>پروفایل من</h1>
          <p>اطلاعات حساب کاربری و سوابق خرید</p>
        </div>
      </div>

      {/* ===== Profile Card ===== */}
      <div className={styles.profileCard}>
        <div className={styles.avatar}>
          {user.name ? user.name[0] : "ک"}
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>
            {user.name || "کاربر بدون نام"}
          </h2>
          <p className={styles.profileEmail}>{user.email}</p>
          {user.phone && (
            <p className={styles.profileEmail}>{user.phone}</p>
          )}
          <span
            className={`${styles.profileRole} ${
              styles[user.role]
            }`}
          >
            {user.role === "admin" ? "ادمین" : "کاربر عادی"}
          </span>
        </div>
        <div className={styles.profileMeta}>
          <span className={styles.joinDate}>
            <MdCalendarToday />
            عضویت: {formatDate(user.createdAt)}
          </span>
        </div>
      </div>

      {/* ===== Stats ===== */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <SiCoursera />
          </div>
          <div className={styles.statInfo}>
            <h3>{formatPrice(stats.purchasedCount)}</h3>
            <p>دوره خریداری شده</p>
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
          <div className={`${styles.statIcon} ${styles.green}`}>
            <MdPayment />
          </div>
          <div className={styles.statInfo}>
            <h3>{formatPrice(stats.totalSpent)}</h3>
            <p>مبلغ کل پرداختی (تومان)</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <FaComments />
          </div>
          <div className={styles.statInfo}>
            <h3>{formatPrice(stats.totalComments)}</h3>
            <p>نظرات ثبت شده</p>
          </div>
        </div>
      </div>

      {/* ===== Bottom: Edit Form + Recent Orders ===== */}
      <div className={styles.bottomGrid}>
        {/* ویرایش اطلاعات */}
        <div className={styles.editSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <FaEdit style={{ marginLeft: "8px", verticalAlign: "middle" }} />
              ویرایش اطلاعات
            </h2>
          </div>

          <div className={styles.editForm}>
            <div className={styles.field}>
              <label>نام و نام خانوادگی</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="نام خود را وارد کنید"
              />
            </div>

            <div className={styles.field}>
              <label>ایمیل</label>
              <input
                type="email"
                value={user.email}
                disabled
              />
            </div>

            <div className={styles.field}>
              <label>شماره موبایل</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="مثال: 09121234567"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className={styles.saveBtn}
            >
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>
        </div>

        {/* آخرین سفارشات */}
        <div className={styles.ordersSection}>
          <div className={styles.sectionHeader}>
            <h2>آخرین سفارشات</h2>
            <Link href="/profile/courses" className={styles.viewAllLink}>
              دوره‌های من
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className={styles.emptyList}>هنوز سفارشی ثبت نشده</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order._id} className={styles.orderItem}>
                <div className={styles.orderInfo}>
                  <span className={styles.orderCourses}>
                    {order.items.length} دوره
                    {order.items[0]?.course?.title
                      ? ` — ${order.items[0].course.title.substring(0, 30)}`
                      : ""}
                  </span>
                  <span className={styles.orderDate}>
                    {formatDateTime(order.createdAt)}
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
