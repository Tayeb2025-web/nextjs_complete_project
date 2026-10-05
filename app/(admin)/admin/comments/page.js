"use client";

import Link from "next/link";
import styles from "../courses/Courses.module.css";
import { useState, useEffect } from "react";

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // حالت مودال پاسخ
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const totalPages = Math.ceil(totalComments / 5);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/admin/comments?page=${page}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments(data.comments || []);
      setTotalComments(data.total);
    } catch (err) {
      setMessage({ text: "خطا در بارگذاری کامنت‌ها", type: "error" });
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openReplyModal = (comment) => {
    setIsReplyModalOpen(true);
    setReplyingToComment(comment);
    setReplyText("");
  };

  const closeReplyModal = () => {
    setIsReplyModalOpen(false);
    setReplyingToComment(null);
    setReplyText("");
  };

  const handleAdminReply = async () => {
    setReplyLoading(true);
    try {
      const res = await fetch(
        `/api/admin/comments/${replyingToComment._id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: replyText.trim(),
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        fetchComments();

        setMessage({
          text: "پاسخ با موفقیت ارسال شد",
          type: "success",
        });

        closeReplyModal();
      } else {
        setMessage({
          text: "خطا در ارسال پاسخ",
          type: "error",
        });
      }
    } catch (err) {
      setMessage({
        text: err.message,
        type: "error",
      });
    } finally {
      setReplyLoading(false);
    }
  };

  const handleApprove = async (commentId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      const res = await fetch(`/api/admin/comments/${commentId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? { ...comment, isApproved: newStatus }
              : comment,
          ),
        );
        setMessage({
          text: `کامنت ${newStatus ? "تأیید" : "رد"} شد`,
          type: "success",
        });
      }
    } catch (err) {
      setMessage({ text: "خطا در عملیات", type: "error" });
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این کامنت را حذف کنید؟")) return;

    try {
      const res = await fetch(`/api/admin/comments/${commentId}/delete`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentId),
        );
        setMessage({ text: "کامنت با موفقیت حذف شد", type: "success" });
      }
    } catch (err) {
      setMessage({ text: "خطای سرور", type: "error" });
    }
  };

  if (loading) return <p>در حال بارگذاری...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>مدیریت نظرات کاربران</h1>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="جستجو در متن، کاربر یا دوره..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">همه کامنت‌ها</option>
          <option value="approved">تأیید شده</option>
          <option value="pending">در انتظار تأیید</option>
        </select>
      </div>

      {message.text && (
        <p className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </p>
      )}

      {comments.length === 0 ? (
        <p className={styles.empty}>هیچ کامنتی یافت نشد.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>کاربر</th>
                <th>دوره</th>
                <th>متن نظر</th>
                <th>وضعیت</th>
                <th>تاریخ</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment._id}>
                  <td className={styles.userCell}>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        {comment.user?.avatar ? (
                          <Image
                            src={comment.user.avatar}
                            alt={comment.user.name}
                            width={40}
                            height={40}
                            className={styles.avatarImg}
                          />
                        ) : (
                          <div className={styles.defaultAvatar}>
                            {comment.user?.name?.[0] || "ک"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={styles.userName}>
                          {comment.user?.name || "ناشناس"}
                        </p>
                        <p className={styles.userPhone}>
                          {comment.user?.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                      {comment.course ? (
                        <Link
                      href={`/course/${comment.course?.slug}`}
                      className={styles.courseLink}
                    >
                      {comment.course?.title.length > 25
                        ? comment.course.title.substring(0, 25)
                        : comment.course.title}
                    </Link>
                      ): (
                        <span>دوره حذف شده</span>
                      )}
                  </td>

                  <td className={styles.commentTextCell}>
                    <p>
                      {comment.text.length > 20
                        ? `${comment.text.substring(0, 20)}...`
                        : comment.text}
                    </p>
                  </td>

                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        comment.isApproved ? styles.published : styles.draft
                      }`}
                    >
                      {comment.isApproved ? "تأیید شده" : "در انتظار"}
                    </span>
                  </td>

                  <td dir="ltr">{formatDate(comment.createdAt)}</td>

                  <td className={styles.actions}>
                    <button
                      onClick={() => openReplyModal(comment)}
                      className={styles.replyBtn}
                    >
                      پاسخ دادن
                    </button>

                    <button
                      onClick={() =>
                        handleApprove(comment._id, comment.isApproved)
                      }
                      className={
                        comment.isApproved
                          ? styles.rejectBtn
                          : styles.approveBtn
                      }
                    >
                      {comment.isApproved ? "رد" : "تأیید"}
                    </button>

                    <button
                      onClick={() => handleDelete(comment._id)}
                      className={styles.deleteBtn}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* مودال پاسخ ادمین */}
      {isReplyModalOpen && replyingToComment && (
        <div className={styles.modalOverlay} onClick={closeReplyModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                پاسخ به نظر کاربر: {replyingToComment.user?.name || "ناشناس"}
              </h3>
              <button onClick={closeReplyModal} className={styles.modalClose}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.originalComment}>
                <p>
                  <strong>نظر اصلی:</strong>
                </p>
                <p>{replyingToComment.text}</p>
              </div>

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="پاسخ خود را بنویسید..."
                rows="6"
                className={styles.modalTextarea}
              />

              <div className={styles.modalFooter}>
                <button onClick={closeReplyModal} className={styles.cancelBtn}>
                  لغو
                </button>
                <button
                  onClick={handleAdminReply}
                  disabled={replyLoading}
                  className={styles.submitBtn}
                >
                  {replyLoading ? "در حال ارسال..." : "ارسال پاسخ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* pagination */}
      <div className={styles.pagination}>
        <button
          onClick={() => setPage((page) => page - 1)}
          disabled={page == 1}
        >
          قبلی
        </button>
        <span>
          صفحه {page} از {totalPages}
        </span>
        <button
          onClick={() => setPage((page) => page + 1)}
          disabled={page == totalPages}
        >
          بعدی
        </button>
      </div>
    </div>
  );
}
