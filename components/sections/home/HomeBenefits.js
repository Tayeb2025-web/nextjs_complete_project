import { FaListUl, FaBookOpen, FaKey } from "react-icons/fa";
import styles from "./Home.module.css";

const benefits = [
  {
    title: "با شناخت دوره انتخاب کن",
    description:
      "توضیحات، سرفصل‌ها و قیمت دوره را قبل از ثبت خرید بررسی کن و مطابق نیازت تصمیم بگیر.",
    icon: FaListUl,
    tone: "orange",
  },
  {
    title: "همهٔ دوره‌ها در یک جا",
    description:
      "بعد از خرید موفق، دوره‌ها را در پنل شخصی ببین و از همان‌جا به جلسات آموزشی دسترسی پیدا کن.",
    icon: FaBookOpen,
    tone: "blue",
  },
  {
    title: "لایسنس در حساب خودت",
    description:
      "برای دوره‌های دارای لایسنس SpotPlayer، کلید ثبت‌شدهٔ مدیر را از بخش لایسنس‌های پنل خودت دریافت کن.",
    icon: FaKey,
    tone: "purple",
  },
];
export default function HomeBenefits() {
  return (
    <section className={styles.benefitsBand} aria-labelledby="benefits-title">
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>از انتخاب دوره تا تماشای آموزش</p>
            <h2 id="benefits-title" className="sectionTitle">
              یادگیری‌ات را منظم ادامه بده
            </h2>
          </div>
        </div>
        <div className={styles.threeColumns}>
          {benefits.map(({ icon: Icon, ...benefit }) => (
            <article key={benefit.title} className={styles.benefit}>
              <span className={`${styles.featureIcon} ${styles[benefit.tone]}`}>
                <Icon aria-hidden="true" />
              </span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
