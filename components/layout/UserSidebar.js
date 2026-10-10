"use client"

import Link from 'next/link';
import styles from './AdminSidebar.module.css';
import { MdCategory, MdDashboard, MdLogout } from 'react-icons/md';
import { FaComments, FaShoppingCart, FaUsers } from 'react-icons/fa';
import { useAuth } from '@/contexts/authContext';
import { usePathname } from 'next/navigation';


export default function UserSidebar(){

    const {logout} = useAuth()

    const pathname = usePathname()
    

    return (
        <div className={styles.sidebar}>
      <h2 className={styles.logo}>
        <Link href="/">نکست وان کد</Link>
      </h2>

      <ul>
        <li className={pathname == 'profile' ? styles.active : ""}>
          <Link href="/profile">
            <MdDashboard />
            <span>پروفایل من</span>
          </Link>
        </li>

        <li className={pathname == '/profile/courses' ? styles.active : ""}>
          <Link href="/profile/courses">
            <FaUsers />
            <span>دوره های من</span>
          </Link>
        </li>

        <li className={pathname == '/profile/licenses' ? styles.active : ""}>
          <Link href="/profile/licences">
            <FaComments />
            <span>لایسنس ها</span>
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