"use client";

import Link from "next/link";
import styles from "./AdminSidebar.module.css";
import { MdCategory, MdDashboard, MdLogout, MdArticle } from "react-icons/md";
import {
  FaComments,
  FaShoppingCart,
  FaUsers,
  FaLaptopCode,
} from "react-icons/fa";
import { SiCoursera } from "react-icons/si";
import { IoIosAddCircle, IoMdSettings } from "react-icons/io";
import { RiDiscountPercentFill } from "react-icons/ri";
import { useAuth } from "@/contexts/authContext";
import { usePathname } from "next/navigation";
import { FiX } from "react-icons/fi";

export default function AdminSidebar({ onNavigate, onClose }) {
  const { logout } = useAuth();

  const pathname = usePathname();

  return (
    <nav
      className={styles.sidebar}
      aria-label="صفحات مدیریت"
      onClick={(event) => {
        if (event.target.closest("a")) onNavigate?.();
      }}
    >
      <div className={styles.brandRow}>
        <h2 className={styles.logo}>
          <Link href="/">سورن کد</Link>
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={styles.closeMenu}
            aria-label="بستن منو"
          >
            <FiX aria-hidden="true" />
          </button>
        )}
      </div>

      <ul>
        <li className={pathname == "/admin/dashboard" ? styles.active : ""}>
          <Link href="/admin/dashboard">
            <MdDashboard />
            <span>داشبورد</span>
          </Link>
        </li>

        <li className={pathname == "/admin/users" ? styles.active : ""}>
          <Link href="/admin/users">
            <FaUsers />
            <span>کاربران</span>
          </Link>
        </li>

        <li className={pathname == "/admin/comments" ? styles.active : ""}>
          <Link href="/admin/comments">
            <FaComments />
            <span>کامنت ها</span>
          </Link>
        </li>

        <li className={pathname == "/admin/courses" ? styles.active : ""}>
          <Link href="/admin/courses">
            <SiCoursera />
            <span>دوره ها</span>
          </Link>
        </li>

        <li className={pathname == "/admin/courses/add" ? styles.active : ""}>
          <Link href="/admin/courses/add">
            <IoIosAddCircle />
            <span>اضافه کردن دوره</span>
          </Link>
        </li>

        <li className={pathname == "/admin/categories" ? styles.active : ""}>
          <Link href="/admin/categories">
            <MdCategory />
            <span>دسته بندی ها</span>
          </Link>
        </li>

        <li className={pathname == "/admin/exercises" ? styles.active : ""}>
          <Link href="/admin/exercises">
            <FaLaptopCode />
            <span>تمرین‌ها</span>
          </Link>
        </li>

        <li className={pathname == "/admin/articles" ? styles.active : ""}>
          <Link href="/admin/articles">
            <MdArticle />
            <span>مقالات</span>
          </Link>
        </li>

        <li className={pathname == "/admin/orders" ? styles.active : ""}>
          <Link href="/admin/orders">
            <FaShoppingCart />
            <span>سفارش ها</span>
          </Link>
        </li>

        <li className={pathname == "/admin/discounts" ? styles.active : ""}>
          <Link href="/admin/discounts">
            <RiDiscountPercentFill />
            <span>تخفیف ها</span>
          </Link>
        </li>

        <li className={pathname == "/admin/settings" ? styles.active : ""}>
          <Link href="/admin/settings">
            <IoMdSettings />
            <span>تنظیمات</span>
          </Link>
        </li>

        <li className={styles.logoutItem}>
          <button onClick={logout} className={styles.logoutBtn}>
            <MdLogout />
            <span>خروج</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
