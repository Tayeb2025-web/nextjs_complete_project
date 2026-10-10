import Category from "@/models/Category";
import { isValidId } from "@/utils/adminValidation";

export async function resolveCourseCategory(id, currentCategory) {
  if (!id) return { category: null };
  if (!isValidId(id)) return { error: "شناسه دسته‌بندی معتبر نیست" };
  const category = await Category.findById(id).select("isActive").lean();
  if (!category) return { error: "دسته‌بندی انتخاب‌شده یافت نشد" };
  if (!category.isActive && String(currentCategory) !== id)
    return { error: "دسته‌بندی انتخاب‌شده غیرفعال است" };
  return { category: category._id };
}
