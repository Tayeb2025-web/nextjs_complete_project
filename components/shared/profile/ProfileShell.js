"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import UserSidebar from "@/components/layout/UserSidebar";
import styles from "@/app/(user)/profile/layout.module.css";

export default function ProfileShell({ children }) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const sidebar = useRef(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1024px)");
    const update = () => {
      setMobile(query.matches);
      if (!query.matches) setMenuOpen(false);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => closeMenu(), [pathname, closeMenu]);

  useEffect(() => {
    if (!mobile || !menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = sidebar.current;
    panel.querySelector("button, a[href]")?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") closeMenu();
      if (event.key !== "Tab") return;
      const controls = [
        ...panel.querySelectorAll("button:not(:disabled), a[href]"),
      ].filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      menuButton.current?.focus();
    };
  }, [mobile, menuOpen, closeMenu]);

  return (
    <div className={styles.userLayout}>
      <header className={styles.mobileHeader} inert={mobile && menuOpen}>
        <button
          ref={menuButton}
          type="button"
          className={styles.menuButton}
          aria-label="باز کردن منوی کاربری"
          aria-expanded={menuOpen}
          aria-controls="profile-sidebar"
          onClick={() => setMenuOpen(true)}
        >
          <FiMenu aria-hidden="true" />
        </button>
        <span>پنل کاربری</span>
        <Link href="/" className={styles.mobileBrand}>
          سورن کد
        </Link>
      </header>
      {mobile && menuOpen && (
        <button
          className={styles.backdrop}
          type="button"
          aria-label="بستن منوی کاربری"
          tabIndex={-1}
          onClick={closeMenu}
        />
      )}
      <aside
        id="profile-sidebar"
        ref={sidebar}
        className={[
          styles.sidebarContainer,
          menuOpen ? styles.sidebarOpen : "",
        ].join(" ")}
        inert={mobile && !menuOpen}
        aria-hidden={mobile && !menuOpen ? true : undefined}
        role={mobile && menuOpen ? "dialog" : undefined}
        aria-modal={mobile && menuOpen ? true : undefined}
        aria-label="منوی کاربری"
      >
        <UserSidebar onNavigate={closeMenu} onClose={closeMenu} />
      </aside>
      <main className={styles.contentContainer} inert={mobile && menuOpen}>
        {children}
      </main>
    </div>
  );
}
