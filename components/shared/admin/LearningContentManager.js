"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import AdminModal from "./AdminModal";
import AdminPagination from "./AdminPagination";
import styles from "./AdminPage.module.css";
import formStyles from "./LearningContentManager.module.css";
import { learningLevels, learningLanguages } from "@/utils/learningOptions";

const Editor = dynamic(() => import("@/components/sections/CKEditor"), {
  ssr: false,
  loading: () => <p>در حال بارگذاری ویرایشگر...</p>,
});
const emptyForm = () => ({
  title: "",
  slug: "",
  summary: "",
  topic: "",
  status: "draft",
  relatedCourse: "",
  level: "beginner",
  minutes: 20,
  statement: "",
  examples: [{ input: "", output: "" }],
  hints: "",
  codeLanguage: "javascript",
  starterCode: "",
  solution: "",
  explanation: "",
  content: "",
  authorName: "",
});

function TextField({
  name,
  label,
  form,
  setForm,
  multiline = false,
  code = false,
  ...props
}) {
  const Component = multiline ? "textarea" : "input";
  return (
    <div className={styles.field}>
      <label htmlFor={"content-" + name}>{label}</label>
      <Component
        id={"content-" + name}
        value={form[name]}
        dir={code ? "ltr" : undefined}
        className={code ? formStyles.codeInput : undefined}
        onChange={(e) =>
          setForm((previous) => ({ ...previous, [name]: e.target.value }))
        }
        {...props}
      />
    </div>
  );
}

export default function LearningContentManager({ type }) {
  const exercise = type === "exercise";
  const singular = exercise ? "تمرین" : "مقاله";
  const plural = exercise ? "تمرین‌ها" : "مقالات";
  const base = exercise ? "exercises" : "articles";
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [editorMode, setEditorMode] = useState("rich");
  const close = useCallback(() => setOpen(false), []);

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/" + base, {
          cache: "no-store",
          signal,
        });
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "خطا در دریافت محتوا");
        setItems(data.items);
        setCourses(data.courses);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [base],
  );
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const openForm = (item) => {
    setEditingId(item?._id || null);
    setEditorMode(
      /<(?:pre|code)\b/i.test(item?.content || "") ? "source" : "rich",
    );
    setForm(
      item
        ? {
            ...emptyForm(),
            ...item,
            relatedCourse: item.relatedCourse || "",
            examples: item.examples?.length
              ? item.examples
              : [{ input: "", output: "" }],
            hints: (item.hints || []).join("\n"),
          }
        : emptyForm(),
    );
    setFormError("");
    setOpen(true);
  };
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch(
        "/api/admin/" + base + (editingId ? "/" + editingId : ""),
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            hints: form.hints
              .split("\n")
              .map((h) => h.trim())
              .filter(Boolean),
            minutes: Number(form.minutes),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "خطا در ذخیره محتوا");
      toast.success(data.message);
      close();
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const remove = async (item) => {
    if (!window.confirm(singular + " «" + item.title + "» حذف شود؟")) return;
    setDeletingId(item._id);
    setError("");
    try {
      const res = await fetch("/api/admin/" + base + "/" + item._id, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "خطا در حذف محتوا");
      setItems((previous) => previous.filter((i) => i._id !== item._id));
      toast.success(data.message);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };
  const filtered = items.filter(
    (item) =>
      (item.title + " " + item.topic + " " + item.slug)
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (status === "all" || item.status === status),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const changeExample = (index, key, value) =>
    setForm((previous) => ({
      ...previous,
      examples: previous.examples.map((e, i) =>
        i === index ? { ...e, [key]: value } : e,
      ),
    }));
  const field = (name, label, props = {}) => (
    <TextField
      name={name}
      label={label}
      form={form}
      setForm={setForm}
      disabled={saving}
      {...props}
    />
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>مدیریت {plural}</h1>
          <p className={styles.subtitle}>
            {exercise
              ? "صورت تمرین، نمونه‌ها، راهنمایی و راه‌حل را برای دانشجوها آماده کنید."
              : "آموزش‌های متنی سایت را بنویسید و منتشر کنید."}
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => openForm()}
          disabled={loading || !!deletingId}
        >
          <FaPlus /> افزودن {singular}
        </button>
      </div>
      <div className={styles.summary}>
        {[
          ["همهٔ " + plural, items.length],
          ["منتشرشده", items.filter((i) => i.status === "published").length],
          ["پیش‌نویس", items.filter((i) => i.status === "draft").length],
        ].map(([label, count]) => (
          <div key={label} className={styles.summaryCard}>
            {label}
            <strong>{count.toLocaleString("fa-IR")}</strong>
          </div>
        ))}
      </div>
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="جستجوی عنوان، موضوع یا آدرس..."
          aria-label="جستجوی محتوا"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className={styles.filterSelect}
          aria-label="وضعیت انتشار"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">همهٔ وضعیت‌ها</option>
          <option value="published">منتشرشده</option>
          <option value="draft">پیش‌نویس</option>
        </select>
        <button
          className={styles.cancelBtn}
          onClick={() => load()}
          disabled={loading}
        >
          تازه‌سازی
        </button>
      </div>
      {error && (
        <p role="alert" className={[styles.message, styles.error].join(" ")}>
          {error}
        </p>
      )}
      {loading ? (
        <p className={styles.empty}>در حال بارگذاری...</p>
      ) : visible.length ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>عنوان</th>
                <th>موضوع</th>
                {exercise && <th>سطح</th>}
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item._id}>
                  <td>
                    <span className={styles.name}>{item.title}</span>
                    <p className={styles.description}>{item.summary}</p>
                  </td>
                  <td>{item.topic}</td>
                  {exercise && <td>{learningLevels[item.level]}</td>}
                  <td>
                    <span
                      className={[
                        styles.badge,
                        item.status === "published"
                          ? styles.active
                          : styles.pending,
                      ].join(" ")}
                    >
                      {item.status === "published" ? "منتشرشده" : "پیش‌نویس"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => openForm(item)}
                        disabled={!!deletingId}
                      >
                        ویرایش
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => remove(item)}
                        disabled={!!deletingId}
                      >
                        {deletingId === item._id ? "در حال حذف..." : "حذف"}
                      </button>
                      {item.status === "published" && (
                        <Link
                          className={styles.link}
                          href={"/" + base + "/" + item.slug}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          نمایش
                        </Link>
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
            {items.length
              ? "محتوایی مطابق جستجو یافت نشد."
              : "هنوز محتوایی ثبت نشده؛ اولین " + singular + " را اضافه کنید."}
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
      {open && (
        <AdminModal
          title={(editingId ? "ویرایش " : "افزودن ") + singular}
          onClose={close}
          busy={saving}
        >
          <form className={styles.modalForm} onSubmit={submit}>
            <div className={styles.modalBody}>
              {field("title", "عنوان *", {
                required: true,
                minLength: 5,
                maxLength: 140,
              })}
              {field("slug", "آدرس انگلیسی *", {
                required: true,
                pattern: "[a-z0-9]+(-[a-z0-9]+)*",
                maxLength: 100,
                dir: "ltr",
                placeholder: exercise ? "even-numbers" : "learning-javascript",
              })}
              {field("summary", "خلاصه *", {
                multiline: true,
                rows: 3,
                required: true,
                minLength: 10,
                maxLength: 300,
              })}
              <div className={styles.row}>
                {field("topic", "موضوع *", {
                  required: true,
                  minLength: 2,
                  maxLength: 60,
                  list: "content-topics",
                  placeholder: "JavaScript",
                })}
                <div className={styles.field}>
                  <label htmlFor="content-status">وضعیت انتشار</label>
                  <select
                    id="content-status"
                    value={form.status}
                    disabled={saving}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="draft">پیش‌نویس</option>
                    <option value="published">منتشرشده</option>
                  </select>
                </div>
              </div>
              <datalist id="content-topics">
                {[
                  "HTML و CSS",
                  "JavaScript",
                  "React",
                  "Next.js",
                  "Node.js",
                  "Git",
                ].map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <div className={styles.field}>
                <label htmlFor="content-course">دورهٔ مرتبط</label>
                <select
                  id="content-course"
                  value={form.relatedCourse}
                  disabled={saving}
                  onChange={(e) =>
                    setForm({ ...form, relatedCourse: e.target.value })
                  }
                >
                  <option value="">بدون دورهٔ مرتبط</option>
                  {form.relatedCourse &&
                    !courses.some((c) => c._id === form.relatedCourse) && (
                      <option value={form.relatedCourse}>
                        دورهٔ قبلی (دیگر منتشرشده نیست)
                      </option>
                    )}
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              {exercise ? (
                <>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="content-level">سطح تمرین</label>
                      <select
                        id="content-level"
                        value={form.level}
                        disabled={saving}
                        onChange={(e) =>
                          setForm({ ...form, level: e.target.value })
                        }
                      >
                        {Object.entries(learningLevels).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                    {field("minutes", "زمان پیشنهادی (دقیقه)", {
                      type: "number",
                      required: true,
                      min: 1,
                      max: 180,
                    })}
                  </div>
                  {field("statement", "صورت تمرین *", {
                    multiline: true,
                    rows: 6,
                    required: true,
                    minLength: 15,
                    maxLength: 12000,
                  })}
                  <div className={styles.field}>
                    <label htmlFor="content-language">نوع کد</label>
                    <select
                      id="content-language"
                      value={form.codeLanguage}
                      disabled={saving}
                      onChange={(e) =>
                        setForm({ ...form, codeLanguage: e.target.value })
                      }
                    >
                      {Object.entries(learningLanguages).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  {field("starterCode", "کد شروع (اختیاری)", {
                    multiline: true,
                    code: true,
                    rows: 6,
                    maxLength: 8000,
                  })}
                  <div className={formStyles.exampleGroup}>
                    <h3>نمونه‌های ورودی و خروجی</h3>
                    {form.examples.map((example, index) => (
                      <div key={index} className={formStyles.example}>
                        <div className={styles.field}>
                          <label htmlFor={"example-input-" + index}>
                            ورودی / شرایط نمونهٔ{" "}
                            {(index + 1).toLocaleString("fa-IR")}
                          </label>
                          <textarea
                            id={"example-input-" + index}
                            rows={2}
                            maxLength={2000}
                            value={example.input}
                            disabled={saving}
                            onChange={(e) =>
                              changeExample(index, "input", e.target.value)
                            }
                          />
                        </div>
                        <div className={styles.field}>
                          <label htmlFor={"example-output-" + index}>
                            خروجی / نتیجهٔ مورد انتظار
                          </label>
                          <textarea
                            id={"example-output-" + index}
                            rows={2}
                            maxLength={2000}
                            value={example.output}
                            disabled={saving}
                            onChange={(e) =>
                              changeExample(index, "output", e.target.value)
                            }
                          />
                        </div>
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          disabled={saving}
                          onClick={() =>
                            setForm({
                              ...form,
                              examples: form.examples.filter(
                                (_, i) => i !== index,
                              ),
                            })
                          }
                        >
                          حذف این نمونه
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={styles.editBtn}
                      disabled={saving || form.examples.length >= 5}
                      onClick={() =>
                        setForm({
                          ...form,
                          examples: [
                            ...form.examples,
                            { input: "", output: "" },
                          ],
                        })
                      }
                    >
                      افزودن نمونه
                    </button>
                  </div>
                  {field(
                    "hints",
                    "راهنمایی‌ها (هر راهنمایی در یک خط؛ حداکثر ۵ مورد)",
                    { multiline: true, rows: 4, maxLength: 2504 },
                  )}
                  {field("solution", "کد راه‌حل پیشنهادی *", {
                    multiline: true,
                    code: true,
                    rows: 9,
                    required: form.status === "published",
                    maxLength: 12000,
                  })}
                  {field("explanation", "توضیح راه‌حل", {
                    multiline: true,
                    rows: 4,
                    maxLength: 3000,
                  })}
                </>
              ) : (
                <>
                  {field("authorName", "نام نویسنده (اختیاری)", {
                    maxLength: 80,
                  })}
                  <div className={styles.field}>
                    <label htmlFor="article-editor-mode">نوع ویرایش متن</label>
                    <select
                      id="article-editor-mode"
                      value={editorMode}
                      disabled={saving}
                      onChange={(event) => setEditorMode(event.target.value)}
                    >
                      <option
                        value="rich"
                        disabled={/<(?:pre|code)\b/i.test(form.content)}
                      >
                        ویرایشگر متنی
                      </option>
                      <option value="source">HTML و قطعه‌کد</option>
                    </select>
                    {editorMode === "source" ? (
                      <>
                        {field("content", "متن HTML مقاله *", {
                          multiline: true,
                          code: true,
                          rows: 14,
                          required: true,
                          maxLength: 100000,
                        })}
                        <p className={styles.hint}>
                          قطعه‌کدها را داخل pre و code قرار دهید و علامت‌های
                          &lt; و &gt; در کد را به &amp;lt; و &amp;gt; تبدیل
                          کنید. برای حفظ قالب قطعه‌کدها، مقالهٔ دارای کد در این
                          حالت باز می‌شود.
                        </p>
                      </>
                    ) : (
                      <>
                        <label>متن مقاله *</label>
                        <div className={formStyles.editor} inert={saving}>
                          <Editor
                            data={form.content}
                            onChange={(content) =>
                              setForm((previous) => ({ ...previous, content }))
                            }
                          />
                        </div>
                      </>
                    )}
                    <p className={styles.hint}>
                      برای بخش‌بندی مقاله از عنوان‌ها استفاده کنید. زمان مطالعه
                      از طول متن محاسبه می‌شود.
                    </p>
                  </div>
                </>
              )}
              {formError && (
                <p
                  role="alert"
                  className={[styles.message, styles.error].join(" ")}
                >
                  {formError}
                </p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={close}
                disabled={saving}
              >
                انصراف
              </button>
              <button className={styles.submitBtn} disabled={saving}>
                {saving ? "در حال ذخیره..." : "ذخیره " + singular}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
