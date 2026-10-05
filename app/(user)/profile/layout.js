import UserSidebar from '@/components/layout/UserSidebar';
import styles from './layout.module.css';

export default function UserLayout ({children}) {

    return (
        <div className={styles.userLayout}>
            <div className={styles.sidebarContainer} >
                <UserSidebar/>
            </div>
            <div className={styles.contentContainer}>
                {children}
            </div>
        </div>
    )
}