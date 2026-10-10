import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SiteSettingsProvider } from "@/contexts/siteSettingsContext";
import styles from "./layout.module.css";

export default function RootGroupLayout({ children }) {
  return (
    <SiteSettingsProvider>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </SiteSettingsProvider>
  );
}
