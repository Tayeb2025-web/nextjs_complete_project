"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { defaultSiteSettings } from "@/configs/siteSettings";
import AdminAccountSettings from "@/components/shared/admin/AdminAccountSettings";
import styles from "@/components/shared/admin/AdminPage.module.css";

export default function Settings() {
  const [formData, setFormData] = useState({ ...defaultSiteSettings });
  const [savedSettings, setSavedSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const loadSettings = useCallback(async (signal) => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/admin/settings", {
        cache: "no-store",
        signal,
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "خطا در دریافت تنظیمات");
      setFormData(data.settings);
      setSavedSettings(data.settings);
    } catch (error) {
      if (error.name !== "AbortError")
        setMessage({ text: error.message, type: "error" });
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadSettings(controller.signal);
    return () => controller.abort();
  }, [loadSettings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "خطا در ذخیره تنظیمات");
      setFormData(data.settings);
      setSavedSettings(data.settings);
      setMessage({ text: data.message, type: "success" });
      toast.success(data.message);
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const changed =
    savedSettings &&
    Object.keys(defaultSiteSettings).some(
      (key) => formData[key] !== savedSettings[key],
    );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>تنظیمات سایت</h1>
          <p className={styles.subtitle}>
            نام سایت، اطلاعات تماس و شبکه‌های اجتماعی را مدیریت کنید.
          </p>
        </div>
      </div>
      {message.text && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`${styles.message} ${styles[message.type]}`}
        >
          {message.text}
        </p>
      )}
      {loading ? (
        <p className={styles.empty}>در حال بارگذاری تنظیمات...</p>
      ) : !savedSettings ? (
        <button className={styles.editBtn} onClick={() => loadSettings()}>
          تلاش دوباره
        </button>
      ) : (
        <form onSubmit={handleSubmit}>
          <fieldset className={styles.settingsSection} disabled={saving}>
            <legend>
              <h2>اطلاعات عمومی</h2>
            </legend>
            <div className={styles.field}>
              <label htmlFor="site-name">نام سایت *</label>
              <input
                id="site-name"
                name="siteName"
                required
                minLength={2}
                maxLength={80}
                value={formData.siteName}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="site-description">توضیحات سایت</label>
              <textarea
                id="site-description"
                name="siteDescription"
                rows={3}
                maxLength={500}
                value={formData.siteDescription}
                onChange={handleChange}
                placeholder="توضیح کوتاه درباره سایت"
              />
            </div>
          </fieldset>
          <fieldset className={styles.settingsSection} disabled={saving}>
            <legend>
              <h2>اطلاعات تماس</h2>
            </legend>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="support-email">ایمیل پشتیبانی</label>
                <input
                  id="support-email"
                  name="supportEmail"
                  type="email"
                  dir="ltr"
                  maxLength={254}
                  value={formData.supportEmail}
                  onChange={handleChange}
                  placeholder="support@example.com"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="support-phone">شماره تماس</label>
                <input
                  id="support-phone"
                  name="supportPhone"
                  type="tel"
                  dir="ltr"
                  maxLength={30}
                  value={formData.supportPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="site-address">نشانی</label>
              <textarea
                id="site-address"
                name="address"
                rows={2}
                maxLength={300}
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <p className={styles.hint}>
              اطلاعات تماس واردشده در پایین صفحات عمومی سایت نمایش داده می‌شود.
            </p>
          </fieldset>
          <fieldset className={styles.settingsSection} disabled={saving}>
            <legend>
              <h2>شبکه‌های اجتماعی</h2>
            </legend>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="telegram-url">لینک تلگرام</label>
                <input
                  id="telegram-url"
                  name="telegramUrl"
                  type="url"
                  dir="ltr"
                  maxLength={300}
                  value={formData.telegramUrl}
                  onChange={handleChange}
                  placeholder="https://t.me/username"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="instagram-url">لینک اینستاگرام</label>
                <input
                  id="instagram-url"
                  name="instagramUrl"
                  type="url"
                  dir="ltr"
                  maxLength={300}
                  value={formData.instagramUrl}
                  onChange={handleChange}
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>
          </fieldset>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              disabled={saving || !changed}
              onClick={() => {
                setFormData({ ...savedSettings });
                setMessage({ text: "", type: "" });
              }}
            >
              انصراف از تغییرات
            </button>
            <button className={styles.submitBtn} disabled={saving || !changed}>
              {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
            </button>
          </div>
        </form>
      )}
      <AdminAccountSettings />
    </div>
  );
}
