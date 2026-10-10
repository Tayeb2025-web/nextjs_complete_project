"use client";

import Link from "next/link";
import {
  FaTelegramPlane,
  FaInstagram,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { useSiteSettings } from "@/contexts/siteSettingsContext";
import styles from "./Footer.module.css";

export default function Footer() {
  const settings = useSiteSettings();
  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.content}>
        <div>
          <Link href="/" className={styles.brand} aria-label={settings.siteName}>
            <img src="/images/logo.webp" alt="" />
            <h2>{settings.siteName}</h2>
          </Link>
          {settings.siteDescription && <p>{settings.siteDescription}</p>}
        </div>
        {(settings.supportEmail ||
          settings.supportPhone ||
          settings.address) && (
          <div className={styles.contact}>
            <h3>ارتباط با ما</h3>
            {settings.supportEmail && (
              <a href={`mailto:${settings.supportEmail}`}>
                <FaEnvelope />
                <span dir="ltr">{settings.supportEmail}</span>
              </a>
            )}
            {settings.supportPhone && (
              <a href={`tel:${settings.supportPhone.replace(/[\s()-]/g, "")}`}>
                <FaPhone />
                <span dir="ltr">{settings.supportPhone}</span>
              </a>
            )}
            {settings.address && <p>{settings.address}</p>}
          </div>
        )}
        {(settings.telegramUrl || settings.instagramUrl) && (
          <div className={styles.social}>
            <h3>شبکه‌های اجتماعی</h3>
            {settings.telegramUrl && (
              <a
                href={settings.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTelegramPlane />
                تلگرام
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
                اینستاگرام
              </a>
            )}
          </div>
        )}
      </div>
      <p className={styles.copyright}>
        تمام حقوق برای {settings.siteName} محفوظ است.
      </p>
    </footer>
  );
}
