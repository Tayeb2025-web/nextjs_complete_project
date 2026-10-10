import User from "@/models/User";
import Order from "@/models/Order";
import Course from "@/models/Course";
import Category from "@/models/Category";

export function formatCourseDuration(chapters, fallback = "") {
  let totalSeconds = 0;
  for (const chapter of chapters || []) {
    for (const lesson of chapter.lessons || []) {
      const duration = String(lesson.duration || "")
        .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
        .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));
      const parts = duration
        .replace(/[^\d:.]/g, "")
        .split(/[:.]/)
        .map(Number);
      if (parts.length === 3)
        totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
      else if (parts.length === 2) totalSeconds += parts[0] * 60 + parts[1];
      else if (parts.length === 1) totalSeconds += parts[0] * 60;
    }
  }
  if (!totalSeconds) return fallback || "—";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours)
    return `${hours.toLocaleString("fa-IR")} ساعت${minutes ? ` و ${minutes.toLocaleString("fa-IR")} دقیقه` : ""}`;
  if (minutes) return `${minutes.toLocaleString("fa-IR")} دقیقه`;
  return `${totalSeconds.toLocaleString("fa-IR")} ثانیه`;
}

export async function getUserCourseAccess(userId) {
  const [user, orders] = await Promise.all([
    User.findById(userId).select("purchasedCourses").lean(),
    Order.find({ user: userId, status: "paid" })
      .select("items.course paidAt createdAt")
      .sort({ createdAt: 1 })
      .lean(),
  ]);
  if (!user) return null;
  const courseIds = new Set((user.purchasedCourses || []).map(String));
  const purchaseDates = new Map();
  for (const order of orders) {
    for (const item of order.items) {
      const id = String(item.course);
      courseIds.add(id);
      if (!purchaseDates.has(id))
        purchaseDates.set(id, order.paidAt || order.createdAt);
    }
  }
  return { courseIds: [...courseIds], purchaseDates };
}

export async function getUserCourses(userId) {
  const access = await getUserCourseAccess(userId);
  if (!access) return null;
  const courses = await Course.find({ _id: { $in: access.courseIds } })
    .select(
      "title slug thumbnail shortDescription category level status lessonsCount totalDuration chapters.lessons.duration",
    )
    .populate("category", "name")
    .lean();
  const library = courses
    .map((course) => ({
      _id: course._id,
      title: course.title,
      slug: course.slug,
      thumbnail: course.thumbnail,
      shortDescription: course.shortDescription,
      category: course.category,
      level: course.level,
      status: course.status,
      lessonsCount:
        (course.chapters || []).reduce(
          (sum, chapter) => sum + (chapter.lessons?.length || 0),
          0,
        ) ||
        course.lessonsCount ||
        0,
      chaptersCount: course.chapters?.length || 0,
      totalDuration: formatCourseDuration(
        course.chapters,
        course.totalDuration,
      ),
      purchasedAt: access.purchaseDates.get(String(course._id)) || null,
    }))
    .sort(
      (first, second) =>
        new Date(second.purchasedAt || 0) - new Date(first.purchasedAt || 0),
    );
  return {
    courses: library,
    unavailableCount: access.courseIds.length - courses.length,
  };
}
