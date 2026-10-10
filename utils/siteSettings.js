import connectMongo from "@/configs/connectDB";
import Setting from "@/models/Setting";
import { defaultSiteSettings } from "@/configs/siteSettings";

export function publicSiteSettings(document) {
  return Object.fromEntries(
    Object.entries(defaultSiteSettings).map(([key, fallback]) => [
      key,
      document?.[key] ?? fallback,
    ]),
  );
}

export async function getSiteSettings() {
  await connectMongo();
  const settings = await Setting.findOne({ key: "general" }).lean();
  return publicSiteSettings(settings);
}
