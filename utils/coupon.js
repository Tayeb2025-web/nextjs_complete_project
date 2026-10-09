export function validateCoupon(data) {
  if (!data || typeof data !== "object" || Array.isArray(data))
    return { error: "اطلاعات کد تخفیف معتبر نیست" };
  const code =
    typeof data.code === "string" ? data.code.trim().toUpperCase() : "";
  if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(code))
    return {
      error:
        "کد تخفیف باید ۳ تا ۳۲ کاراکتر انگلیسی، عدد، خط تیره یا زیرخط باشد",
    };
  if (!["percent", "fixed"].includes(data.type))
    return { error: "نوع تخفیف معتبر نیست" };
  const value = Number(data.value);
  const minPurchase = Number(data.minPurchase);
  const maxDiscount =
    data.maxDiscount === "" || data.maxDiscount == null
      ? null
      : Number(data.maxDiscount);
  if (
    !Number.isSafeInteger(value) ||
    value <= 0 ||
    (data.type === "percent" && value > 99)
  )
    return { error: "مقدار تخفیف باید مثبت باشد؛ تخفیف درصدی بین ۱ تا ۹۹ است" };
  if (!Number.isSafeInteger(minPurchase) || minPurchase < 0)
    return { error: "حداقل مبلغ خرید معتبر نیست" };
  if (
    maxDiscount !== null &&
    (!Number.isSafeInteger(maxDiscount) || maxDiscount <= 0)
  )
    return { error: "سقف تخفیف معتبر نیست" };
  const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime()))
    return { error: "تاریخ انقضا معتبر نیست" };
  if (typeof data.isActive !== "boolean")
    return { error: "وضعیت کد تخفیف معتبر نیست" };
  return {
    value: {
      code,
      type: data.type,
      value,
      minPurchase,
      maxDiscount: data.type === "percent" ? maxDiscount : null,
      expiresAt,
      isActive: data.isActive,
    },
  };
}

export function calculateCouponDiscount(coupon, subtotal, now = new Date()) {
  if (
    !coupon ||
    !coupon.isActive ||
    (coupon.expiresAt && new Date(coupon.expiresAt) <= now)
  )
    return { error: "کد تخفیف نامعتبر، غیرفعال یا منقضی است" };
  if (subtotal < coupon.minPurchase)
    return {
      error: `حداقل مبلغ خرید برای این کد ${coupon.minPurchase.toLocaleString("fa-IR")} تومان است`,
    };
  let amount =
    coupon.type === "percent"
      ? Math.floor((subtotal * coupon.value) / 100)
      : coupon.value;
  if (coupon.type === "percent" && coupon.maxDiscount)
    amount = Math.min(amount, coupon.maxDiscount);
  if (amount <= 0 || amount >= subtotal)
    return { error: "این کد برای مبلغ فعلی سبد خرید قابل استفاده نیست" };
  return { discountAmount: amount };
}
