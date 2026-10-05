"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { FaTrash, FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import { useCart } from "@/contexts/cartContext";
import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";

const Cart = () => {
  const { cart, totalPrice, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleCheckout = async () => {
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          courseIds: cart.map((course) => course._id),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        return toast.error("خطا هنگام ثبت سفارش");
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
                {(course.discountPrice || course.price)?.toLocaleString()} تومان
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
              <span>{totalPrice.toLocaleString()} تومان</span>
            </div>
            {/* اگر تخفیف کلی داشتی، اینجا اضافه کن */}
          </div>

          <div className={styles.totalPrice}>
            <span>پرداخت نهایی</span>
            <span className={styles.finalAmount}>
              {totalPrice.toLocaleString()} تومان
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className={styles.checkoutBtn}
          >
            {loading ? "در حال پردازش..." : "تکمیل خرید"}
          </button>

          <p className={styles.secureNote}>پرداخت امن با درگاه معتبر</p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
