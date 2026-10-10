import mongoose from "mongoose";
import { defaultSiteSettings } from "@/configs/siteSettings";

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "general", required: true },
    siteName: {
      type: String,
      trim: true,
      required: true,
      maxLength: 80,
      default: defaultSiteSettings.siteName,
    },
    siteDescription: { type: String, trim: true, maxLength: 500, default: "" },
    supportEmail: { type: String, trim: true, maxLength: 254, default: "" },
    supportPhone: { type: String, trim: true, maxLength: 30, default: "" },
    address: { type: String, trim: true, maxLength: 300, default: "" },
    telegramUrl: { type: String, trim: true, maxLength: 300, default: "" },
    instagramUrl: { type: String, trim: true, maxLength: 300, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.Setting ||
  mongoose.model("Setting", settingSchema);
