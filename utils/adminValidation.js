export const isValidId = (id) =>
  typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

export function validateCategory(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { error: "اطلاعات دسته‌بندی معتبر نیست" };
  }
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const slug =
    typeof data.slug === "string" ? data.slug.trim().toLowerCase() : "";
  const description =
    typeof data.description === "string" ? data.description.trim() : "";

  if (name.length < 2 || name.length > 80)
    return { error: "نام دسته‌بندی باید بین ۲ تا ۸۰ کاراکتر باشد" };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) {
    return {
      error: "آدرس دسته‌بندی را با حروف انگلیسی، عدد و خط تیره وارد کنید",
    };
  }
  if (description.length > 500)
    return { error: "توضیحات حداکثر ۵۰۰ کاراکتر است" };
  if (typeof data.isActive !== "boolean")
    return { error: "وضعیت دسته‌بندی معتبر نیست" };
  return { value: { name, slug, description, isActive: data.isActive } };
}
