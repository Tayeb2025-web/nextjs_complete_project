import AdminSidebar from '@/components/layout/AdminSidebar';
import styles from './layout.module.css';

export default function AdminLayout ({children}) {

    return (
        <div className={styles.adminLayout}>
            <div className={styles.sidebarContainer} >
                <AdminSidebar/>
            </div>
            <div className={styles.contentContainer}>
                {children}
            </div>
        </div>
    )
}