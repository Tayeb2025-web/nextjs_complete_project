import mongoose from "mongoose";

const userSchema = new mongoose.Schema (
  {
    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true ,
      default: null,
      lowercase: true,
      trim: true,
      unique : true
    },

    name: {
      type: String,
      trim: true,
      default: "",
      maxLength : 50
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    otp: {
      code: {
        type: String,
      },
      expiresAt: {
        type: Date,
      },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    purchasedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        default: [],
      },
    ],
    lastLoginAt: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema);