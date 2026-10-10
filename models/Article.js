import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxLength: 140 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    summary: { type: String, required: true, maxLength: 300 },
    topic: { type: String, required: true, trim: true, maxLength: 60 },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    content: { type: String, required: true, maxLength: 100000 },
    authorName: { type: String, default: "", maxLength: 80 },
    minutes: { type: Number, min: 1, default: 1 },
    relatedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Article ||
  mongoose.model("Article", articleSchema);
