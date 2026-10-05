"use client";

import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import styles from "./CourseComments.module.css";
import { useState } from "react";
import Link from "next/link";

const CourseComments = ({ course, comments = [] }) => {
  const { user } = useAuth();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  // const [comments, setComments] = useState([]);

  const openModal = () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    setIsModalOpen(true);
    setMessage({ text: "", type: "" });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCommentText("");
    setMessage({ text: "", type: "" });
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim() || commentText.trim().length < 10) {
      setMessage({ text: "نظر شما باید حداقل ۱۰ کاراکتر باشد", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/courses/${course.slug}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setCommentText("");
        setMessage({
          text: "نظر شما با موفقیت ارسال شد و پس از تأیید نمایش داده می‌شود.",
          type: "success",
        });
        setTimeout(() => closeModal(), 3000);
      } else {
        setMessage({
          text: result.message || "خطا در ارسال نظر",
          type: "error",
        });
      }
    } catch (err) {
      setMessage({ text: "خطای ارتباط با سرور", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // گروه‌بندی: کامنت‌های اصلی (بدون parentComment)
  const mainComments = comments.filter((comment) => !comment.parentComment);

  // نقشه پاسخ‌ها (replyMap)
  const replyMap = {};
  comments.forEach((comment) => {
    if (comment.parentComment) {
      const parentId = comment.parentComment.toString();
      if (!replyMap[parentId]) replyMap[parentId] = [];
      replyMap[parentId].push(comment);
    }
  });

  
  return (
    <section className={styles.comments}>
      <div className={styles.header}>
        <h2 className={styles.title}>نظرات کاربران ({0})</h2>

        <button onClick={openModal} className={styles.addCommentBtn}>
          + نوشتن نظر
        </button>
      </div>

      {mainComments.length === 0 ? (
        <p className={styles.empty}>هنوز نظری برای این دوره ثبت نشده است.</p>
      ) : (
        <div className={styles.commentsList}>
          {comments.map((comment) => (
            <div key={comment._id} className={styles.commentItem}>
              {/* کامنت اصلی */}
              <div className={styles.commentHeader}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {comment.user?.avatar ? (
                      <Image
                        src={comment.user.avatar}
                        alt={comment.user.name || "کاربر"}
                        width={50}
                        height={50}
                        className={styles.avatarImg}
                      />
                    ) : (
                      <div className={styles.defaultAvatar}>
                        {comment.user?.name?.[0] || "ک"}
                      </div>
                    )}
                  </div>
                  <span className={styles.userName}>
                    {comment.user?.name || "کاربر ناشناس"}
                  </span>
                </div>
                <span className={styles.date}>
                  {formatDate(comment.createdAt)}
                </span>
              </div>

              <p className={styles.commentText}>{comment.text}</p>

              {/* پاسخ ادمین — داخل همان باکس */}
              {replyMap[comment._id] && replyMap[comment._id].length > 0 && (
                <div className={styles.adminReply}>
                  <div className={styles.replyHeader}>
                    <span className={styles.adminBadge}>پاسخ ادمین</span>
                    <span className={styles.date}>
                      {formatDate(replyMap[comment._id][0].createdAt)}
                    </span>
                  </div>
                  <p className={styles.replyText}>
                    {replyMap[comment._id][0].text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* پیام برای کاربران لاگین‌نشده */}
      {!user && (
        <div className={styles.loginPrompt}>
          <p>
            برای نوشتن نظر، باید{" "}
            <Link href="/auth" className={styles.loginLink}>
              وارد حساب کاربری
            </Link>{" "}
            شوید.
          </p>
        </div>
      )}

      {/* مودال نوشتن کامنت */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>نوشتن نظر برای: {course.title}</h3>
              <button onClick={closeModal} className={styles.modalClose}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitComment} className={styles.modalForm}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="نظر شما درباره این دوره چیست؟ حداقل ۱۰ کاراکتر"
                rows="6"
                className={styles.modalTextarea}
                required
                minLength="10"
              />

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={styles.cancelBtn}
                >
                  لغو
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitBtn}
                >
                  {loading ? "در حال ارسال..." : "ارسال نظر"}
                </button>
              </div>
            </form>

            {message.text && (
              <p className={`${styles.modalMessage} ${styles[message.type]}`}>
                {message.text}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CourseComments;
