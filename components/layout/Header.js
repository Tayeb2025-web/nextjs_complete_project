"use client";

import Link from "next/link";
import styles from "./Header.module.css";
import { FaHome, FaMicrophone, FaUsers } from "react-icons/fa";
import { IoSchool } from "react-icons/io5";
import { MdArticle, MdDashboard, MdFavoriteBorder } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { SlBasket } from "react-icons/sl";
import { FaRegCircleUser } from "react-icons/fa6";
import { PiCaretLeft } from "react-icons/pi";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { FiBox } from "react-icons/fi";
import { useAuth } from "@/contexts/authContext";
import { useCart } from "@/contexts/cartContext";

export default function Header() {
 
  const {loading , logout , user} = useAuth();

  const {cartCount} = useCart()


  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <img src="/images/logo.webp" />
        <ul>
          <li>
            <Link href="/">
              <FaHome />
              <span>صفحه اصلی</span>
            </Link>
          </li>
          <li>
            <Link href="/courses">
              <IoSchool />
              <span>دوره های آموزشی</span>
            </Link>
          </li>
          <li>
            <Link href="/podcasts">
              <FaMicrophone />
              <span>پادکست</span>
            </Link>
          </li>
          <li>
            <Link href="/articles">
              <MdArticle />
              <span>مقاله ها</span>
            </Link>
          </li>
        </ul>

        <div>
          {loading ? (
            <div className={styles.skeletonAvatar}></div> 
            
          ) : user ? (
            <div className={`${styles.cardIconWrapper} ${styles.userIcon}`}>
              <LuUserRound />
              <UserProfileMenu role={user.role} logout={logout} />
            </div>
          ) : (
            <Link href="/auth">
              <button className={styles.authBtn}> ورود | ثبت نام </button>
            </Link>
          )}
          <Link href="/cart">
            <div
              className={`${styles.cardIconWrapper} ${styles.cartIconWrapper}`}
            >
              {cartCount> 0 && <div className={styles.cartCount}>{cartCount}</div>}
              <SlBasket />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

// when hover the user icon
const UserProfileMenu = ({ role, logout }) => {
  const menuItems = role === "admin"
    ? [
        { href: "/admin/dashboard", label: "پنل مدیریت", icon: MdDashboard },
        { href: "/admin/courses", label: "مدیریت دوره‌ها", icon: IoSchool },
        { href: "/admin/users", label: "مدیریت کاربران", icon: FaUsers },
      ]
    : [
        { href: "/profile", label: "پروفایل", icon: FaRegCircleUser },
        { href: "/profile/courses", label: "دوره های من", icon: MdFavoriteBorder },
        { href: "/profile/licences", label: "لایسنس های من", icon: FiBox },
      ];

  return (
    <div className={styles.userProfileMenu}>
      <ul>
        {menuItems.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link href={href}>
              <div className={styles.item}>
                <p>
                  <Icon />
                  <span>{label}</span>
                </p>
                <PiCaretLeft className={styles.caretLeft} />
              </div>
            </Link>
          </li>
        ))}

        <li>
          <div className={styles.item} onClick={logout}>
            <p>
              <RiLogoutBoxRLine />
              <span>خروج از حساب کاربری</span>
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
};
