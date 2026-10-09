import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
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
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    minutes: { type: Number, min: 1, max: 180, default: 20 },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    statement: { type: String, required: true, maxLength: 12000 },
    examples: [
      {
        _id: false,
        input: { type: String, maxLength: 2000 },
        output: { type: String, maxLength: 2000 },
      },
    ],
    hints: { type: [String], default: [] },
    codeLanguage: {
      type: String,
      enum: ["javascript", "jsx", "html", "css"],
      default: "javascript",
    },
    starterCode: { type: String, default: "", maxLength: 8000 },
    solution: { type: String, default: "", maxLength: 12000 },
    explanation: { type: String, default: "", maxLength: 3000 },
    relatedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Exercise ||
  mongoose.model("Exercise", exerciseSchema);
