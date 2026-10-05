"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({
    text: "",
    type: "",
  });

  const statusMap = {
    pending: "در انتظار پرداخت",
    paid: "پرداخت شده",
    failed: "ناموفق",
    cancelled: "لغو شده",
  };

  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const totalPages = Math.ceil(totalOrders / 5);

  const getOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders?page=${page}`);
      const data = await res.json();

      
      if (!data.success) {
        setMessage({
          text: data.message,
          type: "error",
        });

        return;
      }

      setOrders(data.orders);
      setTotalOrders(data.total);
    } catch {
      setMessage({
        text: "خطا در دریافت سفارشات",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, [page]);

  const formatPrice = (price) => {
    return Number(price).toLocaleString("fa-IR");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fa-IR");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>مدیریت سفارشات</h1>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="جستجوی نام کاربر..."
          className={styles.searchInput}
        />

        <select className={styles.filterSelect}>
          <option value="all">همه سفارشات</option>
          <option value="pending">در انتظار پرداخت</option>
          <option value="paid">پرداخت شده</option>
          <option value="failed">ناموفق</option>
          <option value="cancelled">لغو شده</option>
        </select>
      </div>

      {message.text && (
        <p className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </p>
      )}

      {loading ? (
        <div className={styles.loading}>در حال دریافت اطلاعات...</div>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>سفارشی پیدا نشد.</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>کاربر</th>
                <th>تعداد دوره</th>
                <th>مبلغ</th>
                <th>وضعیت</th>
                <th>شماره پیگیری</th>
                <th>تاریخ</th>
                <th>عملیات</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        <div className={styles.defaultAvatar}>
                          {order.user?.name?.[0] || "ک"}
                        </div>
                      </div>

                      <div>
                        <div className={styles.userName}>
                          {order.user?.name}
                        </div>

                        <div className={styles.userPhone}>
                          {order.user?.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>{order.items.length} دوره</td>

                  <td className={styles.price}>
                    {formatPrice(order.totalPrice)} تومان
                  </td>

                  <td>
                    <span
                      className={`${styles.statusBadge} ${styles[order.status]}`}
                    >
                      {statusMap[order.status]}
                    </span>
                  </td>

                  <td>{order.refId || "--"}</td>

                  <td>{formatDate(order.createdAt)}</td>

                  <td>
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className={styles.detailsBtn}
                    >
                      مشاهده
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.pagination}>
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          قبلی
        </button>

        <span>
          صفحه {page} از {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          بعدی
        </button>
      </div>
    </div>
  );
}