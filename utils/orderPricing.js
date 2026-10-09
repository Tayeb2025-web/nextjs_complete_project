import Course from "@/models/Course";
import Coupon from "@/models/Coupon";
import { isValidId } from "@/utils/adminValidation";
import { getCoursePrice } from "@/utils/coursePrice";
import { calculateCouponDiscount } from "@/utils/coupon";

export async function getOrderQuote(courseIds, couponCode = "") {
  if (
    !Array.isArray(courseIds) ||
    !courseIds.length ||
    courseIds.length > 100 ||
    courseIds.some((id) => !isValidId(id)) ||
    new Set(courseIds).size !== courseIds.length
  ) {
    return { error: "لیست دوره‌های سبد خرید معتبر نیست", status: 400 };
  }
  if (typeof couponCode !== "string" || couponCode.length > 32)
    return { error: "کد تخفیف معتبر نیست", status: 400 };
  const courses = await Course.find({
    _id: { $in: courseIds },
    status: "published",
  })
    .select("title thumbnail slug price discountPrice isFree")
    .lean();
  if (courses.length !== courseIds.length)
    return {
      error: "یک یا چند دوره دیگر قابل خرید نیست؛ سبد خرید را بررسی کنید",
      status: 400,
    };
  const items = courses.map((course) => ({
    course: course._id,
    price: getCoursePrice(course),
  }));
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  if (!Number.isSafeInteger(subtotal) || subtotal < 0)
    return { error: "قیمت دوره‌ها معتبر نیست", status: 400 };
  const code = couponCode.trim().toUpperCase();
  let discountAmount = 0;
  let coupon = null;
  if (code) {
    coupon = await Coupon.findOne({ code }).lean();
    const discount = calculateCouponDiscount(coupon, subtotal);
    if (discount.error) return { error: discount.error, status: 400 };
    discountAmount = discount.discountAmount;
  }
  return {
    courses,
    items,
    subtotal,
    discountAmount,
    totalPrice: subtotal - discountAmount,
    couponCode: code,
    coupon: coupon?._id || null,
  };
}
