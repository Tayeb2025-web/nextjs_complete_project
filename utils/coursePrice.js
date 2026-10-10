export function getCoursePrice(course) {
  if (course.isFree) return 0;
  const price = Number(course.price);
  const discountPrice = Number(course.discountPrice);
  return discountPrice > 0 && discountPrice < price ? discountPrice : price;
}

export function validateCoursePricing({ price, discountPrice, isFree }) {
  if (isFree) return { price: 0, discountPrice: null };
  const original = Number(price);
  if (!Number.isSafeInteger(original) || original <= 0) {
    return { error: "قیمت دوره باید عدد صحیح و بیشتر از صفر باشد" };
  }
  if (
    discountPrice === "" ||
    discountPrice === null ||
    discountPrice === undefined
  ) {
    return { price: original, discountPrice: null };
  }
  const discounted = Number(discountPrice);
  if (
    !Number.isSafeInteger(discounted) ||
    discounted <= 0 ||
    discounted >= original
  ) {
    return {
      error: "قیمت تخفیف‌خورده باید بیشتر از صفر و کمتر از قیمت اصلی باشد",
    };
  }
  return { price: original, discountPrice: discounted };
}
