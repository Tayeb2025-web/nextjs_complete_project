"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "./AdminPagination";
import styles from "./AdminPage.module.css";

const blank = { email: "", key: "", downloadUrl: "", isActive: true };
export default function AdminCourseLicences({ courseId }) {
  const [licences, setLicences] = useState([]);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setLicences([]);
    (async () => {
      try {
        const response = await fetch(
          `/api/admin/licences?courseId=${courseId}&page=${page}`,
          { cache: "no-store", signal: controller.signal },
        );
        const data = await response.json();
        if (!response.ok || !data.success)
          throw new Error(data.message || "خطا در دریافت لایسنس‌ها");
        if (!controller.signal.aborted) {
          setLicences(data.licences);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [courseId, page, retry]);
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/licences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, courseId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(data.message || "خطا در ثبت لایسنس");
      setForm(blank);
      setPage(1);
      setRetry((value) => value + 1);
      toast.success(data.message);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className={styles.accountSection}>
      <h2>لایسنس‌های SpotPlayer این دوره</h2>
      <p className={styles.hint}>
        لایسنس آماده را از پنل SpotPlayer دریافت و برای صاحب دوره ثبت کنید. برای
        هر کاربر و دوره یک لایسنس ذخیره می‌شود؛ ثبت مجدد همان ایمیل، اطلاعات
        قبلی را به‌روزرسانی می‌کند.
      </p>
      <p className={styles.hint}>
        گزینهٔ فعال، نمایش کلید در حساب کاربر را کنترل می‌کند. برای مسدود کردن
        پخش، لایسنس را در پنل SpotPlayer نیز غیرفعال کنید.
      </p>
      {error && (
        <p role="alert" className={`${styles.message} ${styles.error}`}>
          {error}
        </p>
      )}
      <form onSubmit={save}>
        <fieldset className={styles.settingsSection} disabled={saving}>
          <div className={styles.field}>
            <label htmlFor="licence-email">ایمیل صاحب دوره *</label>
            <input
              id="licence-email"
              type="email"
              required
              maxLength={254}
              dir="ltr"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="licence-key">کلید آمادهٔ لایسنس *</label>
            <textarea
              id="licence-key"
              required
              minLength={16}
              maxLength={20000}
              rows={4}
              dir="ltr"
              spellCheck={false}
              value={form.key}
              onChange={(event) =>
                setForm({ ...form, key: event.target.value })
              }
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="licence-download">
              لینک دانلود فایل دوره (اختیاری)
            </label>
            <input
              id="licence-download"
              type="url"
              dir="ltr"
              maxLength={2048}
              placeholder="https://dl.spotplayer.ir/..."
              value={form.downloadUrl}
              onChange={(event) =>
                setForm({ ...form, downloadUrl: event.target.value })
              }
            />
          </div>
          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm({ ...form, isActive: event.target.checked })
              }
            />
            نمایش لایسنس در حساب کاربر
          </label>
        </fieldset>
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            disabled={saving}
            onClick={() => setForm(blank)}
          >
            پاک کردن فرم
          </button>
          <button className={styles.submitBtn} disabled={saving}>
            {saving ? "در حال ذخیره..." : "ذخیرهٔ لایسنس"}
          </button>
        </div>
      </form>
      {loading ? (
        <p className={styles.empty}>در حال دریافت لایسنس‌ها...</p>
      ) : error && !licences.length ? (
        <button
          className={styles.editBtn}
          onClick={() => setRetry((value) => value + 1)}
        >
          تلاش دوباره
        </button>
      ) : !licences.length ? (
        <p className={styles.empty}>هنوز لایسنسی برای این دوره ثبت نشده است.</p>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>کاربر</th>
                  <th>ایمیل</th>
                  <th>وضعیت نمایش</th>
                  <th>آخرین تغییر</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {licences.map((licence) => (
                  <tr key={licence._id}>
                    <td>{licence.user?.name || "کاربر حذف‌شده"}</td>
                    <td dir="ltr">{licence.user?.email || "—"}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${licence.isActive ? styles.active : styles.inactive}`}
                      >
                        {licence.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td>
                      {new Date(licence.updatedAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td>
                      <button
                        className={styles.editBtn}
                        disabled={saving || !licence.user}
                        onClick={() => {
                          setForm({
                            email: licence.user.email,
                            key: licence.key,
                            downloadUrl: licence.downloadUrl,
                            isActive: licence.isActive,
                          });
                          document.getElementById("licence-email")?.focus();
                        }}
                      >
                        ویرایش
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        </>
      )}
    </section>
  );
}
