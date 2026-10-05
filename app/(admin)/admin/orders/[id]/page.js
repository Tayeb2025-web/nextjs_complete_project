"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import styles from "./page.module.css";
import { useParams } from "next/navigation";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  const getOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrder();
  }, []);

  const formatPrice = (price) => Number(price).toLocaleString("fa-IR");
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusMap = {
    pending: "در انتظار پرداخت",
    paid: "پرداخت شده",
    failed: "ناموفق",
    cancelled: "لغو شده",
  };

  if (loading) {
    return <div className={styles.loading}>در حال دریافت اطلاعات...</div>;
  }

  if (!order) {
    return <div className={styles.notFound}>سفارش پیدا نشد.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>جزئیات سفارش</h1>
          <p>شماره سفارش : {order._id}</p>
        </div>

        <Link href="/admin/orders" className={styles.backBtn}>
          بازگشت
        </Link>
      </div>

      {/* اطلاعات سفارش */}

      <div className={styles.card}>
        <h2>اطلاعات سفارش</h2>
        <div className={styles.infoGrid}>
          <div>
            <span>وضعیت</span>
            <strong className={`${styles.badge} ${styles[order.status]}`}>
              {statusMap[order.status]}
            </strong>
          </div>

          <div>
            <span>مبلغ کل</span>
            <strong>{formatPrice(order.totalPrice)} تومان</strong>
          </div>

          <div>
            <span>Authority</span>
            <strong>{order.authority}</strong>
          </div>

          <div>
            <span>RefId</span>
            <strong>{order.refId || "--"}</strong>
          </div>

          <div>
            <span>تاریخ ثبت</span>
            <strong>{formatDate(order.createdAt)}</strong>
          </div>

          <div>
            <span>تاریخ پرداخت</span>
            <strong>{order.paidAt ? formatDate(order.paidAt) : "--"}</strong>
          </div>
        </div>
      </div>

      {/* کاربر */}

      <div className={styles.card}>
        <h2>اطلاعات خریدار</h2>

        <div className={styles.user}>
          <div className={styles.avatar}>
            <div className={styles.defaultAvatar}>{order.user.name[0]}</div>
          </div>

          <div>
            <p>{order.user.name}</p>
            <span>{order.user.phone}</span>
          </div>
        </div>
      </div>

      {/* دوره ها */}

      <div className={styles.card}>
        <h2>دوره‌های خریداری شده</h2>

        <div className={styles.courses}>
          {order.items.map((item) => (
            <div key={item.course._id} className={styles.course}>
              <Image
                src={item.course.thumbnail}
                alt=""
                width={110}
                height={70}
              />

              <div className={styles.courseContent}>
                <h3>{item.course.title}</h3>

                <span>{formatPrice(item.price)} تومان</span>
              </div>

              <Link
                href={`/course/${item.course.slug}`}
                target="_blank"
                className={styles.viewBtn}
              >
                مشاهده
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}