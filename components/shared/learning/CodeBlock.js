"use client";

import { FaRegCopy } from "react-icons/fa";
import toast from "react-hot-toast";
import styles from "./Learning.module.css";

export default function CodeBlock({ code, language, label = "کد" }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("کد کپی شد");
    } catch {
      toast.error("کپی خودکار ممکن نیست؛ کد را انتخاب و کپی کنید.");
    }
  };
  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span>
          {label}
          {language ? " · " + language : ""}
        </span>
        <button type="button" onClick={copy} aria-label={"کپی " + label}>
          <FaRegCopy aria-hidden="true" /> کپی
        </button>
      </div>
      <pre dir="ltr">
        <code>{code}</code>
      </pre>
    </div>
  );
}
