"use client";

import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import AdminModal from "./AdminModal";
import AdminPagination from "./AdminPagination";
import styles from "./AdminPage.module.css";

const emptyForm = {
  code: "",
  type: "percent",
  value: "",
  minPurchase: "0",
  maxDiscount: "",
  expiresAt: "",
  isActive: true,
};
const money = (value) => `${Number(value).toLocaleString("fa-IR")} تومان`;
const isExpired = (coupon) =>
  coupon.expiresAt && new Date(coupon.expiresAt) <= new Date();
const localDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const loadCoupons = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        cache: "no-store",
        signal,
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "خطا در دریافت کدهای تخفیف");
      setCoupons(data.coupons);
    } catch (error) {
      if (error.name !== "AbortError") setError(error.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadCoupons(controller.signal);
    return () => controller.abort();
  }, [loadCoupons]);

  const openForm = (coupon) => {
    setEditingId(coupon?._id || null);
    setFormData(
      coupon
        ? {
            code: coupon.code,
            type: coupon.type,
            value: String(coupon.value),
            minPurchase: String(coupon.minPurchase),
            maxDiscount:
              coupon.maxDiscount == null ? "" : String(coupon.maxDiscount),
            expiresAt: localDateTime(coupon.expiresAt),
            isActive: coupon.isActive,
          }
        : { ...emptyForm },
    );
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch(
        editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            expiresAt: formData.expiresAt
              ? new Date(formData.expiresAt).toISOString()
              : null,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "خطا در ذخیره کد تخفیف");
      toast.success(data.message);
      closeModal();
      await loadCoupons();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`کد تخفیف «${coupon.code}» حذف شود؟`)) return;
    setDeletingId(coupon._id);
    setError("");
    try {
      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "خطا در حذف کد تخفیف");
      setCoupons((previous) =>
        previous.filter((item) => item._id !== coupon._id),
      );
      toast.success(data.message);
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = coupons.filter(
    (coupon) =>
      coupon.code.includes(search.trim().toUpperCase()) &&
      (filter === "all" ||
        (filter === "active"
          ? coupon.isActive && !isExpired(coupon)
          : filter === "expired"
            ? isExpired(coupon)
            : !coupon.isActive)),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const changeField = (event) =>
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>مدیریت کدهای تخفیف</h1>
          <p className={styles.subtitle}>
            کد تخفیف درصدی یا مبلغی برای سبد خرید ایجاد کنید.
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => openForm()}
          disabled={loading || !!deletingId}
        >
          <FaPlus />
          افزودن کد تخفیف
        </button>
      </div>
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          همه کدها<strong>{coupons.length.toLocaleString("fa-IR")}</strong>
        </div>
        <div className={styles.summaryCard}>
          کدهای فعال
          <strong>
            {coupons
              .filter((item) => item.isActive && !isExpired(item))
              .length.toLocaleString("fa-IR")}
          </strong>
        </div>
        <div className={styles.summaryCard}>
          خریدهای پرداخت‌شده با کد
          <strong>
            {coupons
              .reduce((sum, item) => sum + item.usedCount, 0)
              .toLocaleString("fa-IR")}
          </strong>
        </div>
      </div>
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="جستجوی کد تخفیف..."
          aria-label="جستجوی کد تخفیف"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <select
          className={styles.filterSelect}
          aria-label="وضعیت کد تخفیف"
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="all">همه کدها</option>
          <option value="active">فعال</option>
          <option value="inactive">غیرفعال</option>
          <option value="expired">منقضی</option>
        </select>
        <button
          className={styles.cancelBtn}
          onClick={() => loadCoupons()}
          disabled={loading || !!deletingId}
        >
          تازه‌سازی
        </button>
      </div>
      {error && (
        <p role="alert" className={`${styles.message} ${styles.error}`}>
          {error}
        </p>
      )}
      {loading ? (
        <p className={styles.empty}>در حال بارگذاری کدهای تخفیف...</p>
      ) : visible.length ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>کد</th>
                <th>تخفیف</th>
                <th>حداقل خرید</th>
                <th>انقضا</th>
                <th>وضعیت</th>
                <th>خرید موفق</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((coupon) => (
                <tr key={coupon._id}>
                  <td dir="ltr" className={styles.name}>
                    {coupon.code}
                  </td>
                  <td>
                    {coupon.type === "percent"
                      ? `${coupon.value.toLocaleString("fa-IR")}٪`
                      : money(coupon.value)}
                    {coupon.maxDiscount && (
                      <p className={styles.description}>
                        سقف: {money(coupon.maxDiscount)}
                      </p>
                    )}
                  </td>
                  <td>
                    {coupon.minPurchase
                      ? money(coupon.minPurchase)
                      : "بدون حداقل"}
                  </td>
                  <td>
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleString("fa-IR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "بدون انقضا"}
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${isExpired(coupon) ? styles.pending : coupon.isActive ? styles.active : styles.inactive}`}
                    >
                      {isExpired(coupon)
                        ? "منقضی"
                        : coupon.isActive
                          ? "فعال"
                          : "غیرفعال"}
                    </span>
                  </td>
                  <td>{coupon.usedCount.toLocaleString("fa-IR")}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => openForm(coupon)}
                        disabled={!!deletingId}
                      >
                        ویرایش
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(coupon)}
                        disabled={!!deletingId}
                      >
                        {deletingId === coupon._id ? "در حال حذف..." : "حذف"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && (
          <p className={styles.empty}>
            {coupons.length
              ? "کدی مطابق جستجوی شما یافت نشد."
              : "هنوز کد تخفیف ثبت نشده است."}
          </p>
        )
      )}
      {!loading && (
        <AdminPagination
          page={currentPage}
          totalPages={totalPages}
          onChange={setPage}
        />
      )}
      {modalOpen && (
        <AdminModal
          title={editingId ? "ویرایش کد تخفیف" : "افزودن کد تخفیف"}
          onClose={closeModal}
          busy={saving}
        >
          <form className={styles.modalForm} onSubmit={handleSubmit}>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label htmlFor="coupon-code">کد تخفیف *</label>
                <input
                  id="coupon-code"
                  name="code"
                  dir="ltr"
                  required
                  minLength={3}
                  maxLength={32}
                  pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,31}"
                  value={formData.code}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      code: event.target.value.toUpperCase(),
                    })
                  }
                  placeholder="WELCOME20"
                  disabled={saving}
                />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="coupon-type">نوع تخفیف</label>
                  <select
                    id="coupon-type"
                    name="type"
                    value={formData.type}
                    onChange={changeField}
                    disabled={saving}
                  >
                    <option value="percent">درصدی</option>
                    <option value="fixed">مبلغی (تومان)</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="coupon-value">
                    {formData.type === "percent"
                      ? "درصد تخفیف (۱ تا ۹۹)"
                      : "مبلغ تخفیف (تومان)"}{" "}
                    *
                  </label>
                  <input
                    id="coupon-value"
                    name="value"
                    type="number"
                    min={1}
                    max={formData.type === "percent" ? 99 : undefined}
                    step={1}
                    required
                    value={formData.value}
                    onChange={changeField}
                    disabled={saving}
                  />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="coupon-minimum">حداقل خرید (تومان)</label>
                  <input
                    id="coupon-minimum"
                    name="minPurchase"
                    type="number"
                    min={0}
                    step={1}
                    required
                    value={formData.minPurchase}
                    onChange={changeField}
                    disabled={saving}
                  />
                </div>
                {formData.type === "percent" && (
                  <div className={styles.field}>
                    <label htmlFor="coupon-maximum">
                      سقف تخفیف (اختیاری، تومان)
                    </label>
                    <input
                      id="coupon-maximum"
                      name="maxDiscount"
                      type="number"
                      min={1}
                      step={1}
                      value={formData.maxDiscount}
                      onChange={changeField}
                      disabled={saving}
                    />
                  </div>
                )}
              </div>
              <div className={styles.field}>
                <label htmlFor="coupon-expiration">
                  تاریخ و ساعت انقضا (اختیاری)
                </label>
                <input
                  id="coupon-expiration"
                  name="expiresAt"
                  type="datetime-local"
                  dir="ltr"
                  value={formData.expiresAt}
                  onChange={changeField}
                  disabled={saving}
                />
                <p className={styles.hint}>
                  بر اساس ساعت محلی دستگاه شما؛ خالی یعنی بدون انقضا.
                </p>
              </div>
              <label className={styles.checkboxField}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(event) =>
                    setFormData({ ...formData, isActive: event.target.checked })
                  }
                  disabled={saving}
                />
                کد فعال باشد
              </label>
              <p className={styles.hint}>
                کد روی مجموع قیمت فعلی دوره‌ها، پس از تخفیف قیمت دوره، اعمال
                می‌شود.
              </p>
              {formError && (
                <p role="alert" className={`${styles.message} ${styles.error}`}>
                  {formError}
                </p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={closeModal}
                disabled={saving}
              >
                انصراف
              </button>
              <button className={styles.submitBtn} disabled={saving}>
                {saving ? "در حال ذخیره..." : "ذخیره کد تخفیف"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
