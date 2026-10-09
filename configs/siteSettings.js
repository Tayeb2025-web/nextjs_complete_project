export const defaultSiteSettings = {
  siteName: "سورن کد",
  siteDescription: "",
  supportEmail: "",
  supportPhone: "",
  address: "",
  telegramUrl: "",
  instagramUrl: "",
};

export function validateSiteSettings(data) {
  if (!data || typeof data !== "object" || Array.isArray(data))
    return { error: "اطلاعات تنظیمات معتبر نیست" };
  const value = {};
  for (const key of Object.keys(defaultSiteSettings)) {
    if (typeof data[key] !== "string")
      return { error: "تمام فیلدهای تنظیمات را به‌درستی وارد کنید" };
    value[key] = data[key].trim();
  }
  if (value.siteName.length < 2 || value.siteName.length > 80)
    return { error: "نام سایت باید بین ۲ تا ۸۰ کاراکتر باشد" };
  if (value.siteDescription.length > 500 || value.address.length > 300)
    return { error: "توضیحات یا نشانی بیش از حد طولانی است" };
  if (
    value.supportEmail &&
    (value.supportEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.supportEmail))
  )
    return { error: "ایمیل پشتیبانی معتبر نیست" };
  if (value.supportPhone && !/^\+?[\d\s()-]{5,30}$/.test(value.supportPhone))
    return { error: "شماره تماس معتبر نیست" };
  for (const key of ["telegramUrl", "instagramUrl"]) {
    if (!value[key]) continue;
    try {
      const url = new URL(value[key]);
      if (
        !["https:", "http:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        value[key].length > 300
      )
        throw new Error();
    } catch {
      return {
        error: "لینک شبکه اجتماعی باید یک آدرس معتبر با http یا https باشد",
      };
    }
  }
  return { value };
}
