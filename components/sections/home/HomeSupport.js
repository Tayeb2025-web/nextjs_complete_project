"use client";

import Link from "next/link";
import { FaArrowLeft, FaTelegramPlane } from "react-icons/fa";
import { useAuth } from "@/contexts/authContext";
import { useSiteSettings } from "@/contexts/siteSettingsContext";
import styles from "./Home.module.css";

export default function HomeSupport() {
  const settings = useSiteSettings();
  const { user } = useAuth();
  return (
    <section
      id="home-support"
      className={`${styles.container} ${styles.support}`}
      aria-labelledby="support-title"
    >
      <div>
        <p className={styles.kicker}>قدم اول را همین امروز بردار</p>
        <h2 id="support-title">برای شروع آماده‌ای؟</h2>
        <p>
          دوره‌ها را ببین و آموزش مناسب خودت را انتخاب کن. اگر دربارهٔ انتخاب
          دوره یا دسترسی به آموزش سؤال داری، با پشتیبانی در تماس باش.
        </p>
      </div>
      <div className={styles.supportActions}>
        <Link href="/courses" className={styles.primaryButton}>
          انتخاب دوره <FaArrowLeft aria-hidden="true" />
        </Link>
        {settings.telegramUrl ? (
          <a
            href={settings.telegramUrl}
            className={styles.secondaryButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTelegramPlane aria-hidden="true" />
            گفتگو در تلگرام
          </a>
        ) : (
          <a href="#contact" className={styles.secondaryButton}>
            تماس با پشتیبانی
          </a>
        )}
        <Link
          className={styles.supportAccount}
          href={
            user
              ? user.role === "admin"
                ? "/admin/dashboard"
                : "/profile/courses"
              : "/auth"
          }
        >
          {user ? "رفتن به پنل من" : "حساب داری؟ وارد شو"}
        </Link>
      </div>
    </section>
  );
}
