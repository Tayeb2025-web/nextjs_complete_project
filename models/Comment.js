import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    // کاربری که نظر داده
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // دوره‌ای که نظر برای آن ثبت شده
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // متن نظر
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },

    // وضعیت تأیید توسط ادمین
    isApproved: {
      type: Boolean,
      default: false,
    },

    // پاسخ به کامنت دیگران (ریپلای کردن کامنت توسط ادمین)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // آیا نظر توسط ادمین نوشته شده؟
    isAdminReply: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Comment ||
  mongoose.model("Comment", CommentSchema);