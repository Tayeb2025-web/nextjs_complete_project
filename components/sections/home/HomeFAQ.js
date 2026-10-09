import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import styles from "./Home.module.css";

const questions = [
  {
    question: "برای شروع باید برنامه‌نویسی بلد باشم؟",
    answer: (
      <>
        برای یادگیری پایه‌های طراحی وب می‌توانی از HTML و CSS شروع کنی. قبل از
        انتخاب هر دوره، توضیحات و پیش‌نیازهای آن را بخوان تا سطح مناسبی انتخاب
        کنی. <Link href="#learning-guide">راهنمای شروع یادگیری</Link> هم به
        انتخاب قدم بعدی کمک می‌کند.
      </>
    ),
  },
  {
    question: "چطور آموزش‌های رایگان را پیدا کنم؟",
    answer: (
      <>
        در <Link href="/courses">فهرست دوره‌ها</Link>، دوره‌های رایگان با عبارت
        «رایگان» مشخص شده‌اند. در صفحهٔ هر دوره می‌توانی سرفصل‌ها و جلسات در
        دسترس را ببینی.
      </>
    ),
  },
  {
    question: "بعد از خرید، دوره را از کجا ببینم؟",
    answer: (
      <>
        پس از پرداخت موفق، وارد حساب خودت شو و بخش{" "}
        <Link href="/profile/courses">دوره‌های من</Link> را باز کن. دوره‌های
        ثبت‌شده در حساب و دسترسی به جلسات در همین بخش نمایش داده می‌شوند.
      </>
    ),
  },
  {
    question: "لایسنس SpotPlayer را چطور دریافت کنم؟",
    answer: (
      <>
        اگر دوره با SpotPlayer ارائه می‌شود، مدیر لایسنس اختصاصی تو را ثبت
        می‌کند. بعد از ثبت، کلید در بخش{" "}
        <Link href="/profile/licences">لایسنس‌های من</Link> قابل مشاهده و کپی
        است. اگر وضعیت «در انتظار ثبت» بود، از پشتیبانی پیگیری کن.
      </>
    ),
  },
  {
    question: "چطور وارد حساب کاربری شوم؟",
    answer: (
      <>
        از بخش <Link href="/auth">ورود و ثبت‌نام</Link> ایمیلت را وارد کن و با
        کد یک‌بارمصرفی که دریافت می‌کنی وارد حساب شو. برای دسترسی به خریدهای
        قبلی، از همان ایمیل حساب خودت استفاده کن.
      </>
    ),
  },
];
export default function HomeFAQ() {
  return (
    <section
      className={`${styles.container} ${styles.section} ${styles.faqGrid}`}
      aria-labelledby="faq-title"
    >
      <div className={styles.faqIntro}>
        <p className={styles.kicker}>قبل از شروع</p>
        <h2 id="faq-title" className="sectionTitle">
          سؤال‌های پرتکرار
        </h2>
        <p className={styles.sectionDescription}>
          جواب چند سؤال دربارهٔ انتخاب دوره، حساب کاربری و دسترسی به آموزش‌ها.
        </p>
        <a href="#home-support" className={styles.textLink}>
          سؤال دیگری داری؟
        </a>
      </div>
      <div className={styles.faqList}>
        {questions.map((item, index) => (
          <details
            key={item.question}
            name="home-faq"
            className={styles.faqItem}
            open={index === 0}
          >
            <summary>
              <h3>{item.question}</h3>
              <FaPlus aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
