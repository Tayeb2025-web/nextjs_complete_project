import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
progressSchema.index({ user: 1, exercise: 1 }, { unique: true });

export default mongoose.models.ExerciseProgress ||
  mongoose.model("ExerciseProgress", progressSchema);
