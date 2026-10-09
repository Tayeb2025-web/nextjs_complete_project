"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import AdminModal from "@/components/shared/admin/AdminModal";
import AdminPagination from "@/components/shared/admin/AdminPagination";
import styles from "@/components/shared/admin/AdminPage.module.css";

const emptyForm = { name: "", slug: "", description: "", isActive: true };
const pageSize = 10;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const loadCategories = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories", {
        cache: "no-store",
        signal,
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "خطا در دریافت دسته‌بندی‌ها");
      setCategories(data.categories);
    } catch (error) {
      if (error.name !== "AbortError") setError(error.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadCategories(controller.signal);
    return () => controller.abort();
  }, [loadCategories]);

  const openForm = (category) => {
    setEditingId(category?._id || null);
    setFormData(
      category
        ? {
            name: category.name,
            slug: category.slug,
            description: category.description,
            isActive: category.isActive,
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
        editingId
          ? `/api/admin/categories/${editingId}`
          : "/api/admin/categories",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "خطا در ذخیره دسته‌بندی");
      toast.success(data.message);
      closeModal();
      await loadCategories();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`دسته‌بندی «${category.name}» حذف شود؟`)) return;
    setDeletingId(category._id);
    setError("");
    try {
      const res = await fetch(`/api/admin/categories/${category._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "خطا در حذف دسته‌بندی");
      setCategories((previous) =>
        previous.filter((item) => item._id !== category._id),
      );
      toast.success(data.message);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = categories.filter((item) => {
    const matchesSearch = `${item.name} ${item.slug}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    return (
      matchesSearch &&
      (status === "all" || item.isActive === (status === "active"))
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>مدیریت دسته‌بندی‌ها</h1>
          <p className={styles.subtitle}>
            دسته‌بندی دوره‌های آموزشی را ایجاد و ویرایش کنید.
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => openForm()}
          disabled={loading || !!deletingId}
        >
          <FaPlus /> افزودن دسته‌بندی
        </button>
      </div>
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          همه دسته‌بندی‌ها
          <strong>{categories.length.toLocaleString("fa-IR")}</strong>
        </div>
        <div className={styles.summaryCard}>
          دسته‌بندی‌های فعال
          <strong>
            {categories
              .filter((item) => item.isActive)
              .length.toLocaleString("fa-IR")}
          </strong>
        </div>
        <div className={styles.summaryCard}>
          دوره‌های دسته‌بندی‌شده
          <strong>
            {categories
              .reduce((sum, item) => sum + item.coursesCount, 0)
              .toLocaleString("fa-IR")}
          </strong>
        </div>
      </div>
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          aria-label="جستجوی دسته‌بندی"
          placeholder="جستجو در نام یا آدرس دسته‌بندی..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <select
          className={styles.filterSelect}
          aria-label="وضعیت دسته‌بندی"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="inactive">غیرفعال</option>
        </select>
        <button
          className={styles.cancelBtn}
          onClick={() => loadCategories()}
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
        <p className={styles.empty}>در حال بارگذاری دسته‌بندی‌ها...</p>
      ) : visible.length ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>نام دسته‌بندی</th>
                <th>آدرس</th>
                <th>تعداد دوره‌ها</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((category) => (
                <tr key={category._id}>
                  <td>
                    <span className={styles.name}>{category.name}</span>
                    {category.description && (
                      <p className={styles.description}>
                        {category.description}
                      </p>
                    )}
                  </td>
                  <td dir="ltr">{category.slug}</td>
                  <td>
                    <Link
                      className={styles.link}
                      href={`/admin/courses?category=${category._id}`}
                    >
                      {category.coursesCount.toLocaleString("fa-IR")} دوره
                    </Link>
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${category.isActive ? styles.active : styles.inactive}`}
                    >
                      {category.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => openForm(category)}
                        disabled={!!deletingId}
                      >
                        ویرایش
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(category)}
                        disabled={!!deletingId}
                      >
                        {deletingId === category._id ? "در حال حذف..." : "حذف"}
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
            {categories.length
              ? "دسته‌بندی مطابق جستجوی شما یافت نشد."
              : "هنوز دسته‌بندی ایجاد نشده است. اولین دسته‌بندی را اضافه کنید."}
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
          title={editingId ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}
          onClose={closeModal}
          busy={saving}
        >
          <form className={styles.modalForm} onSubmit={handleSubmit}>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label htmlFor="category-name">نام دسته‌بندی *</label>
                <input
                  id="category-name"
                  required
                  minLength={2}
                  maxLength={80}
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                  placeholder="مثال: برنامه‌نویسی وب"
                  disabled={saving}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="category-slug">آدرس دسته‌بندی *</label>
                <input
                  id="category-slug"
                  dir="ltr"
                  required
                  maxLength={100}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  value={formData.slug}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      slug: event.target.value.toLowerCase(),
                    })
                  }
                  placeholder="web-development"
                  disabled={saving}
                />
                <p className={styles.hint}>
                  حروف انگلیسی، عدد و خط تیره؛ بدون فاصله.
                </p>
              </div>
              <div className={styles.field}>
                <label htmlFor="category-description">توضیحات</label>
                <textarea
                  id="category-description"
                  rows={3}
                  maxLength={500}
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description: event.target.value,
                    })
                  }
                  disabled={saving}
                />
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
                دسته‌بندی فعال باشد
              </label>
              <p className={styles.hint}>
                دسته‌بندی غیرفعال در فیلتر عمومی و انتخاب دسته‌بندی جدید دوره
                نمایش داده نمی‌شود.
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
                {saving ? "در حال ذخیره..." : "ذخیره دسته‌بندی"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
