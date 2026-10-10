"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import AdminModal from "@/components/shared/admin/AdminModal";
import AdminPagination from "@/components/shared/admin/AdminPagination";
import AdminCoupons from "@/components/shared/admin/AdminCoupons";
import { getCoursePrice } from "@/utils/coursePrice";
import styles from "@/components/shared/admin/AdminPage.module.css";

const formatPrice = (value) => `${Number(value).toLocaleString("fa-IR")} تومان`;
const hasDiscount = (course) => getCoursePrice(course) < course.price;
const percentOff = (course, price = getCoursePrice(course)) =>
  Math.round((1 - price / course.price) * 100);
const statusLabels = {
  published: "منتشر شده",
  draft: "پیش‌نویس",
  "coming-soon": "به زودی",
};
const pageSize = 10;

export default function Discounts() {
  const [tab, setTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const loadCourses = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/discounts", {
        cache: "no-store",
        signal,
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "خطا در دریافت تخفیف‌ها");
      setCourses(data.courses);
    } catch (error) {
      if (error.name !== "AbortError") setError(error.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadCourses(controller.signal);
    return () => controller.abort();
  }, [loadCourses]);

  const openForm = (course) => {
    setEditing(!!course);
    setCourseId(course?._id || "");
    setDiscountPrice(
      course && hasDiscount(course) ? String(course.discountPrice) : "",
    );
    setFormError("");
    setModalOpen(true);
  };

  const updateDiscount = async (id, price) => {
    const res = await fetch(`/api/admin/discounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discountPrice: price }),
    });
    const data = await res.json();
    if (!res.ok || !data.success)
      throw new Error(data.message || "خطا در ذخیره تخفیف");
    setCourses((previous) =>
      previous.map((course) => (course._id === id ? data.course : course)),
    );
    toast.success(data.message);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!courseId || discountPrice === "") {
      setFormError("دوره و قیمت تخفیف‌خورده را وارد کنید");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await updateDiscount(courseId, Number(discountPrice));
      closeModal();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (course) => {
    if (!window.confirm(`تخفیف دوره «${course.title}» حذف شود؟`)) return;
    setRemovingId(course._id);
    setError("");
    try {
      await updateDiscount(course._id, null);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setRemovingId(null);
    }
  };

  const filtered = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(search.trim().toLowerCase()) &&
      (filter === "all" || hasDiscount(course) === (filter === "discounted")),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const discountedCount = courses.filter(hasDiscount).length;
  const selected = courses.find((course) => course._id === courseId);
  const validPreview =
    selected &&
    Number(discountPrice) > 0 &&
    Number(discountPrice) < selected.price;

  return (
    <>
      <div className={styles.tabs}>
        <button
          className={tab === "courses" ? styles.selectedTab : ""}
          onClick={() => setTab("courses")}
        >
          تخفیف دوره‌ها
        </button>
        <button
          className={tab === "coupons" ? styles.selectedTab : ""}
          onClick={() => setTab("coupons")}
        >
          کدهای تخفیف خرید
        </button>
      </div>
      {tab === "coupons" ? (
        <AdminCoupons />
      ) : (
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>مدیریت تخفیف‌ها</h1>
              <p className={styles.subtitle}>
                قیمت تخفیف‌خورده دوره‌ها را مدیریت کنید.
              </p>
            </div>
            <button
              className={styles.addButton}
              onClick={() => openForm()}
              disabled={
                loading || !!removingId || courses.length === discountedCount
              }
            >
              <FaPlus /> افزودن تخفیف
            </button>
          </div>
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              دوره‌های غیررایگان
              <strong>{courses.length.toLocaleString("fa-IR")}</strong>
            </div>
            <div className={styles.summaryCard}>
              دوره‌های دارای تخفیف
              <strong>{discountedCount.toLocaleString("fa-IR")}</strong>
            </div>
            <div className={styles.summaryCard}>
              دوره‌های بدون تخفیف
              <strong>
                {(courses.length - discountedCount).toLocaleString("fa-IR")}
              </strong>
            </div>
          </div>
          <div className={styles.filters}>
            <input
              className={styles.searchInput}
              placeholder="جستجو در عنوان دوره..."
              aria-label="جستجوی دوره"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <select
              className={styles.filterSelect}
              value={filter}
              aria-label="وضعیت تخفیف"
              onChange={(event) => {
                setFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">همه دوره‌ها</option>
              <option value="discounted">دارای تخفیف</option>
              <option value="regular">بدون تخفیف</option>
            </select>
            <button
              className={styles.cancelBtn}
              onClick={() => loadCourses()}
              disabled={loading || !!removingId}
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
            <p className={styles.empty}>در حال بارگذاری تخفیف‌ها...</p>
          ) : visible.length ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>دوره</th>
                    <th>قیمت اصلی</th>
                    <th>قیمت با تخفیف</th>
                    <th>درصد تخفیف</th>
                    <th>وضعیت دوره</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((course) => (
                    <tr key={course._id}>
                      <td>
                        <Link
                          className={`${styles.name} ${styles.link}`}
                          href={`/admin/courses/${course.slug}/edit`}
                        >
                          {course.title}
                        </Link>
                      </td>
                      <td>{formatPrice(course.price)}</td>
                      <td>
                        {hasDiscount(course)
                          ? formatPrice(course.discountPrice)
                          : "—"}
                      </td>
                      <td>
                        {hasDiscount(course) ? (
                          <span className={`${styles.badge} ${styles.active}`}>
                            {percentOff(course).toLocaleString("fa-IR")}٪
                          </span>
                        ) : (
                          <span className={styles.hint}>بدون تخفیف</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${course.status === "published" ? styles.active : course.status === "draft" ? styles.inactive : styles.pending}`}
                        >
                          {statusLabels[course.status]}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.editBtn}
                            onClick={() => openForm(course)}
                            disabled={!!removingId}
                          >
                            {hasDiscount(course) ? "ویرایش" : "افزودن تخفیف"}
                          </button>
                          {hasDiscount(course) && (
                            <button
                              className={styles.deleteBtn}
                              onClick={() => handleRemove(course)}
                              disabled={!!removingId}
                            >
                              {removingId === course._id
                                ? "در حال حذف..."
                                : "حذف تخفیف"}
                            </button>
                          )}
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
                {courses.length
                  ? "دوره مطابق جستجوی شما یافت نشد."
                  : "برای ثبت تخفیف، ابتدا یک دوره غیررایگان اضافه کنید."}
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
              title={editing ? "مدیریت تخفیف دوره" : "افزودن تخفیف"}
              onClose={closeModal}
              busy={saving}
            >
              <form className={styles.modalForm} onSubmit={handleSubmit}>
                <div className={styles.modalBody}>
                  <div className={styles.field}>
                    <label htmlFor="discount-course">دوره *</label>
                    <select
                      id="discount-course"
                      required
                      value={courseId}
                      onChange={(event) => {
                        setCourseId(event.target.value);
                        setDiscountPrice("");
                      }}
                      disabled={editing || saving}
                    >
                      <option value="">انتخاب دوره</option>
                      {courses
                        .filter((course) =>
                          editing
                            ? course._id === courseId
                            : !hasDiscount(course),
                        )
                        .map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.title}
                          </option>
                        ))}
                    </select>
                  </div>
                  {selected && (
                    <p className={styles.hint}>
                      قیمت اصلی: {formatPrice(selected.price)}
                    </p>
                  )}
                  <div className={styles.field}>
                    <label htmlFor="discount-price">
                      قیمت نهایی بعد از تخفیف (تومان) *
                    </label>
                    <input
                      id="discount-price"
                      type="number"
                      required
                      min={1}
                      step={1}
                      max={selected ? selected.price - 1 : undefined}
                      value={discountPrice}
                      onChange={(event) => setDiscountPrice(event.target.value)}
                      disabled={!selected || saving}
                    />
                  </div>
                  {validPreview && (
                    <p className={`${styles.message} ${styles.success}`}>
                      تخفیف{" "}
                      {percentOff(
                        selected,
                        Number(discountPrice),
                      ).toLocaleString("fa-IR")}
                      ٪؛ کاهش قیمت{" "}
                      {formatPrice(selected.price - Number(discountPrice))}
                    </p>
                  )}
                  <p className={styles.hint}>
                    این قیمت در نمایش دوره و سفارش‌های جدید اعمال می‌شود. برای
                    حذف تخفیف از دکمه «حذف تخفیف» استفاده کنید.
                  </p>
                  {formError && (
                    <p
                      role="alert"
                      className={`${styles.message} ${styles.error}`}
                    >
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
                  <button
                    className={styles.submitBtn}
                    disabled={saving || !selected}
                  >
                    {saving ? "در حال ذخیره..." : "ذخیره تخفیف"}
                  </button>
                </div>
              </form>
            </AdminModal>
          )}
        </div>
      )}
    </>
  );
}
