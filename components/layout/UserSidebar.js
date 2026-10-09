"use client";

import Link from "next/link";
import styles from "./AdminSidebar.module.css";
import { MdDashboard, MdLogout } from "react-icons/md";
import { FaComments, FaUsers } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { useAuth } from "@/contexts/authContext";
import { usePathname } from "next/navigation";

export default function UserSidebar({ onNavigate, onClose }) {
  const { logout } = useAuth();

  const pathname = usePathname();

  return (
    <nav
      className={styles.sidebar}
      aria-label="صفحات حساب کاربری"
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
            className={styles.closeMenu}
            onClick={onClose}
            aria-label="بستن منو"
          >
            <FiX aria-hidden="true" />
          </button>
        )}
      </div>

      <ul>
        <li className={pathname == "/profile" ? styles.active : ""}>
          <Link href="/profile">
            <MdDashboard />
            <span>پروفایل من</span>
          </Link>
        </li>

        <li className={pathname == "/profile/courses" ? styles.active : ""}>
          <Link href="/profile/courses">
            <FaUsers />
            <span>دوره های من</span>
          </Link>
        </li>

        <li className={pathname == "/profile/licences" ? styles.active : ""}>
          <Link href="/profile/licences">
            <FaComments />
            <span>لایسنس ها</span>
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
