import { isValidId } from "./adminValidation.js";
import { plainText, sanitizeArticle } from "./learningText.js";

export function validateLearningContent(data, type) {
  if (!data || typeof data !== "object" || Array.isArray(data))
    return { error: "اطلاعات ارسالی معتبر نیست" };
  const text = (key) => (typeof data[key] === "string" ? data[key].trim() : "");
  const value = {
    title: text("title"),
    slug: text("slug").toLowerCase(),
    summary: text("summary"),
    topic: text("topic"),
    status: data.status,
    relatedCourse: data.relatedCourse || null,
  };
  if (value.title.length < 5 || value.title.length > 140)
    return { error: "عنوان باید بین ۵ تا ۱۴۰ کاراکتر باشد" };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug) || value.slug.length > 100)
    return { error: "آدرس را با حروف انگلیسی، عدد و خط تیره وارد کنید" };
  if (value.summary.length < 10 || value.summary.length > 300)
    return { error: "خلاصه باید بین ۱۰ تا ۳۰۰ کاراکتر باشد" };
  if (value.topic.length < 2 || value.topic.length > 60)
    return { error: "موضوع باید بین ۲ تا ۶۰ کاراکتر باشد" };
  if (!["draft", "published"].includes(value.status))
    return { error: "وضعیت انتشار معتبر نیست" };
  if (value.relatedCourse !== null && !isValidId(value.relatedCourse))
    return { error: "دورهٔ مرتبط معتبر نیست" };

  if (type === "exercise") {
    Object.assign(value, {
      level: data.level,
      minutes: Number(data.minutes),
      statement: text("statement"),
      codeLanguage: data.codeLanguage,
      starterCode: text("starterCode"),
      solution: text("solution"),
      explanation: text("explanation"),
    });
    if (!["beginner", "intermediate", "advanced"].includes(value.level))
      return { error: "سطح تمرین معتبر نیست" };
    if (
      !Number.isInteger(value.minutes) ||
      value.minutes < 1 ||
      value.minutes > 180
    )
      return { error: "زمان تمرین باید بین ۱ تا ۱۸۰ دقیقه باشد" };
    if (!["javascript", "jsx", "html", "css"].includes(value.codeLanguage))
      return { error: "نوع کد معتبر نیست" };
    if (value.statement.length < 15 || value.statement.length > 12000)
      return { error: "صورت تمرین باید بین ۱۵ تا ۱۲۰۰۰ کاراکتر باشد" };
    if (
      value.starterCode.length > 8000 ||
      value.solution.length > 12000 ||
      value.explanation.length > 3000
    )
      return { error: "حجم کد یا توضیح راه‌حل بیش از حد مجاز است" };
    if (value.status === "published" && !value.solution)
      return { error: "برای انتشار تمرین، راه‌حل پیشنهادی را وارد کنید" };
    if (
      !Array.isArray(data.hints) ||
      data.hints.length > 5 ||
      data.hints.some((h) => typeof h !== "string" || h.trim().length > 500)
    )
      return { error: "حداکثر ۵ راهنمایی، هرکدام تا ۵۰۰ کاراکتر وارد کنید" };
    if (
      !Array.isArray(data.examples) ||
      data.examples.length > 5 ||
      data.examples.some(
        (e) =>
          !e ||
          typeof e.input !== "string" ||
          typeof e.output !== "string" ||
          e.input.length > 2000 ||
          e.output.length > 2000,
      )
    )
      return {
        error: "نمونه‌های ورودی و خروجی معتبر نیستند؛ حداکثر ۵ نمونه وارد کنید",
      };
    value.hints = data.hints.map((h) => h.trim()).filter(Boolean);
    value.examples = data.examples
      .map((e) => ({ input: e.input.trim(), output: e.output.trim() }))
      .filter((e) => e.input || e.output);
  } else {
    if (typeof data.content !== "string" || data.content.length > 100000)
      return { error: "متن مقاله معتبر نیست یا بیش از حد طولانی است" };
    value.content = sanitizeArticle(data.content);
    if (plainText(value.content).trim().length < 30)
      return { error: "متن مقاله باید دست‌کم ۳۰ کاراکتر داشته باشد" };
    value.authorName = text("authorName");
    if (value.authorName.length > 80)
      return { error: "نام نویسنده حداکثر ۸۰ کاراکتر است" };
    value.minutes = Math.max(
      1,
      Math.ceil(plainText(value.content).trim().split(/\s+/).length / 200),
    );
  }
  return { value };
}
