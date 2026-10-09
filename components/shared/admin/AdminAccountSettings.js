"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/authContext";
import styles from "./AdminPage.module.css";

export default function AdminAccountSettings() {
  const { setUser } = useAuth();
  const [account, setAccount] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const controller = new AbortController();
    const loadAccount = async () => {
      setLoading(true);
      setMessage({ text: "", type: "" });
      try {
        const res = await fetch("/api/admin/settings/account", {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "خطا در دریافت حساب مدیر");
        setAccount(data.user);
        setFormData({
          name: data.user.name || "",
          phone: data.user.phone || "",
        });
      } catch (error) {
        if (error.name !== "AbortError")
          setMessage({ text: error.message, type: "error" });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadAccount();
    return () => controller.abort();
  }, [retry]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/admin/settings/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "خطا در ذخیره حساب مدیر");
      setAccount(data.user);
      setFormData({ name: data.user.name || "", phone: data.user.phone || "" });
      setUser((previous) =>
        previous &&
        String(previous._id ?? previous.id) === String(data.user._id)
          ? { ...previous, ...data.user }
          : previous,
      );
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
    account &&
    (formData.name !== (account.name || "") ||
      formData.phone !== (account.phone || ""));
  return (
    <section className={styles.accountSection}>
      <h2>حساب مدیر</h2>
      {message.text && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`${styles.message} ${styles[message.type]}`}
        >
          {message.text}
        </p>
      )}
      {loading ? (
        <p className={styles.empty}>در حال دریافت اطلاعات حساب...</p>
      ) : !account ? (
        <button
          className={styles.editBtn}
          onClick={() => setRetry((value) => value + 1)}
        >
          تلاش دوباره
        </button>
      ) : (
        <form onSubmit={handleSubmit}>
          <fieldset className={styles.settingsSection} disabled={saving}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="admin-name">نام و نام خانوادگی *</label>
                <input
                  id="admin-name"
                  required
                  minLength={2}
                  maxLength={50}
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="admin-phone">شماره تماس</label>
                <input
                  id="admin-phone"
                  type="tel"
                  dir="ltr"
                  maxLength={30}
                  value={formData.phone}
                  onChange={(event) =>
                    setFormData({ ...formData, phone: event.target.value })
                  }
                />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="admin-email">ایمیل ورود</label>
              <input
                id="admin-email"
                type="email"
                dir="ltr"
                value={account.email}
                disabled
              />
              <p className={styles.hint}>
                ورود با کد یک‌بارمصرف ایمیل انجام می‌شود؛ ایمیل ورود در این فرم
                قابل تغییر نیست.
              </p>
            </div>
          </fieldset>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              disabled={saving || !changed}
              onClick={() =>
                setFormData({
                  name: account.name || "",
                  phone: account.phone || "",
                })
              }
            >
              انصراف از تغییرات
            </button>
            <button className={styles.submitBtn} disabled={saving || !changed}>
              {saving ? "در حال ذخیره..." : "ذخیره حساب مدیر"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
