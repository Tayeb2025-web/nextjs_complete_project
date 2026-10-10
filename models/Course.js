import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  duration: {
    type: String, // مثال: "12:30"
    required: true,
  },

  isFree: {
    type: Boolean,
    default: false,
  },
  videoUrl: {
    type: String,
    required: true, // اگر همه درس‌ها ویدیو ندارن
  },
});

const ChapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  lessons: {
    type: [LessonSchema],
    default: [],
  },
});

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: true,
      maxlength: 300,
      trim: true,
    },

    fullDescription: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String, // مسیر تصویر
      required: false,
    },

    price: {
      type: Number,
      required: true,
    },

    discountPrice: {
      type: Number,
      default: null
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    chapters: {
      type: [ChapterSchema],
      default: [],
    },

    totalDuration: {
      type: String, // مثال: "18 ساعت"
      default: "",
    },

    lessonsCount: {
      type: Number,
      default: 0,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    status: {
      type: String,
      enum: ["draft", "published", "coming-soon"],
      default: "draft",
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    studentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);