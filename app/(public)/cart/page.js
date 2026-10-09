"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { FaTrash, FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import { useCart } from "@/contexts/cartContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";

const Cart = () => {
  const { cart, totalPrice, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [retry, setRetry] = useState(0);
  const cartIds = cart.map((course) => course._id).join(",");
  const userId = user?._id ?? user?.id;
  const quoteKey = `${userId || ""}|${cartIds}|${couponCode}`;
  const currentQuote = quote?.key === quoteKey ? quote : null;
  const finalPrice = currentQuote ? currentQuote.totalPrice : totalPrice;

  useEffect(() => {
    const controller = new AbortController();
    if (!userId || !cartIds) {
      setQuote(null);
      setQuoteError("");
      setQuoteLoading(false);
      return;
    }
    const loadQuote = async () => {
      setQuoteLoading(true);
      setQuoteError("");
      try {
        const res = await fetch("/api/cart/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseIds: cartIds.split(","), couponCode }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "خطا در بررسی مبلغ سبد خرید");
        setQuote({ ...data, key: quoteKey });
      } catch (error) {
        if (error.name !== "AbortError") {
          setQuote(null);
          setQuoteError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) setQuoteLoading(false);
      }
    };
    loadQuote();
    return () => controller.abort();
  }, [userId, cartIds, couponCode, quoteKey, retry]);

  const router = useRouter();

  const handleCheckout = async () => {
    if (!userId) {
      router.push("/auth");
      return;
    }
    if (!currentQuote) return;
    setLoading(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          courseIds: cart.map((course) => course._id),
          couponCode,
          expectedTotal: currentQuote.totalPrice,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        setRetry((value) => value + 1);
        return toast.error(orderData.message || "خطا هنگام ثبت سفارش");
      }

      toast.success("در حال انتقال به درگاه پرداخت");

      const paymentRes = await fetch("/api/payment/request", {
        method: "POST",
        body: JSON.stringify({ orderId: orderData.orderId }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const paymentData = await paymentRes.json();
      if (!paymentData.success) {
        return toast.error("خطا در ارسال به درگاه پرداخت");
      }

      router.push(paymentData.paymentUrl);
    } catch (error) {
      toast.error("خطای سرور");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <FaShoppingCart size={80} color="#cbd5e1" />
        <h2>سبد خرید شما خالی است</h2>
        <p>هنوز دوره‌ای به سبد خرید اضافه نکرده‌اید.</p>
        <Link href="/courses" className={styles.browseBtn}>
          مشاهده دوره‌ها
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>سبد خرید</h1>
        <Link href="/courses" className={styles.backLink}>
          <FaArrowLeft />
          ادامه خرید
        </Link>
      </div>

      <div className={styles.cartContainer}>
        <div className={styles.cartItems}>
          {cart.map((course) => (
            <div key={course._id} className={styles.cartItem}>
              <div className={styles.itemThumbnail}>
                <Image
                  src={course.thumbnail || "/images/default-course.jpg"}
                  alt={course.title}
                  width={120}
                  height={80}
                  className={styles.thumbnailImg}
                />
              </div>

              <div className={styles.itemInfo}>
                <h3 className={styles.itemTitle}>{course.title}</h3>
              </div>

              <div className={styles.itemPrice}>
                {(
                  currentQuote?.items.find((item) => item.course === course._id)
                    ?.price ??
                  (course.isFree ? 0 : course.discountPrice || course.price)
                )?.toLocaleString()}{" "}
                تومان
              </div>

              <button
                onClick={() => removeFromCart(course._id)}
                className={styles.removeBtn}
                aria-label="حذف از سبد"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.cartSummary}>
          <div className={styles.summaryHeader}>
            <h3>خلاصه سبد خرید</h3>
            <p>{cart.length} دوره</p>
          </div>

          <div className={styles.priceDetails}>
            <div className={styles.priceRow}>
              <span>مجموع قیمت</span>
              <span>
                {(currentQuote?.subtotal ?? totalPrice).toLocaleString()} تومان
              </span>
            </div>
          </div>

          {currentQuote?.discountAmount > 0 && (
            <div className={styles.priceRow}>
              <span>تخفیف کد {currentQuote.couponCode}</span>
              <span>{currentQuote.discountAmount.toLocaleString()} تومان</span>
            </div>
          )}

          <div className={styles.totalPrice}>
            <span>پرداخت نهایی</span>
            <span className={styles.finalAmount}>
              {finalPrice.toLocaleString()} تومان
            </span>
          </div>

          <form
            className={styles.couponForm}
            onSubmit={(event) => {
              event.preventDefault();
              if (couponInput.trim()) {
                setCouponCode(couponInput.trim().toUpperCase());
                setRetry((value) => value + 1);
              }
            }}
          >
            <label htmlFor="cart-coupon">کد تخفیف</label>
            <div className={styles.couponRow}>
              <input
                id="cart-coupon"
                dir="ltr"
                maxLength={32}
                value={couponInput}
                onChange={(event) =>
                  setCouponInput(event.target.value.toUpperCase())
                }
                placeholder="کد تخفیف را وارد کنید"
                disabled={loading || !userId}
              />
              <button
                disabled={
                  loading || quoteLoading || !userId || !couponInput.trim()
                }
              >
                اعمال
              </button>
            </div>
            {couponCode && (
              <button
                type="button"
                className={styles.removeCoupon}
                onClick={() => {
                  setCouponCode("");
                  setCouponInput("");
                }}
                disabled={loading}
              >
                حذف کد تخفیف
              </button>
            )}
            {quoteLoading && (
              <p role="status">در حال بررسی مبلغ و کد تخفیف...</p>
            )}
            {quoteError && (
              <p role="alert" className={styles.couponError}>
                {quoteError}{" "}
                <button
                  type="button"
                  onClick={() => setRetry((value) => value + 1)}
                  disabled={loading || quoteLoading}
                >
                  تلاش دوباره
                </button>
              </p>
            )}
            {!userId && !authLoading && (
              <p>برای اعمال کد تخفیف، ابتدا وارد حساب شوید.</p>
            )}
          </form>

          <button
            onClick={handleCheckout}
            type="button"
            disabled={
              loading ||
              authLoading ||
              (userId && (!currentQuote || quoteLoading))
            }
            className={styles.checkoutBtn}
          >
            {loading
              ? "در حال پردازش..."
              : !userId && !authLoading
                ? "ورود و تکمیل خرید"
                : "تکمیل خرید"}
          </button>

          <p className={styles.secureNote}>پرداخت امن با درگاه معتبر</p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
