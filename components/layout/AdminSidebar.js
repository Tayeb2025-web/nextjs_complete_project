"use client"

import Link from 'next/link';
import styles from './AdminSidebar.module.css';
import { MdCategory, MdDashboard, MdLogout } from 'react-icons/md';
import { FaComments, FaShoppingCart, FaUsers } from 'react-icons/fa';
import { SiCoursera } from 'react-icons/si';
import { IoIosAddCircle, IoMdSettings } from 'react-icons/io';
import { RiDiscountPercentFill } from 'react-icons/ri';
import { useAuth } from '@/contexts/authContext';
import { usePathname } from 'next/navigation';


export default function AdminSidebar(){

    const {logout} = useAuth()

    const pathname = usePathname()
    

    return (
        <div className={styles.sidebar}>
      <h2 className={styles.logo}>
        <Link href="/">نکست وان کد</Link>
      </h2>

      <ul>
        <li className={pathname == '/admin/dashboard' ? styles.active : ""}>
          <Link href="/admin/dashboard">
            <MdDashboard />
            <span>داشبورد</span>
          </Link>
        </li>

        <li className={pathname == '/admin/users' ? styles.active : ""}>
          <Link href="/admin/users">
            <FaUsers />
            <span>کاربران</span>
          </Link>
        </li>

        <li className={pathname == '/admin/comments' ? styles.active : ""}>
          <Link href="/admin/comments">
            <FaComments />
            <span>کامنت ها</span>
          </Link>
        </li>

        <li className={pathname == '/admin/courses' ? styles.active : ""}>
          <Link href="/admin/courses">
            <SiCoursera />
            <span>دوره ها</span>
          </Link>
        </li>

        <li className={pathname == '/admin/courses/add' ? styles.active : ""}>
          <Link href="/admin/courses/add">
            <IoIosAddCircle />
            <span>اضافه کردن دوره</span>
          </Link>
        </li>

        <li className={pathname == '/admin/categories' ? styles.active : ""}>
          <Link href="/admin/categories">
            <MdCategory />
            <span>دسته بندی ها</span>
          </Link>
        </li>

        <li className={pathname == '/admin/orders' ? styles.active : ""}>
          <Link href="/admin/orders">
            <FaShoppingCart />
            <span>سفارش ها</span>
          </Link>
        </li>

        <li className={pathname == '/admin/discounts' ? styles.active : ""}>
          <Link href="/admin/discounts">
            <RiDiscountPercentFill />
            <span>تخفیف ها</span>
          </Link>
        </li>

        <li className={pathname == '/admin/settings' ? styles.active : ""}>
          <Link href="/admin/settings">
            <IoMdSettings />
            <span>تنظیمات</span>
          </Link>
        </li>

        <li className={styles.logoutItem}>
          <button onClick={logout}  className={styles.logoutBtn}>
            <MdLogout />
            <span>خروج</span>
          </button>
        </li>
      </ul>
    </div>
    )
}