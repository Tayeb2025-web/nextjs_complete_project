import mongoose from "mongoose";

const LicenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    key: { type: String, required: true, trim: true, maxlength: 20000 },
    downloadUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
LicenceSchema.index({ user: 1, course: 1 }, { unique: true });
LicenceSchema.index({ key: 1 }, { unique: true });

export default mongoose.models.Licence ||
  mongoose.model("Licence", LicenceSchema);
