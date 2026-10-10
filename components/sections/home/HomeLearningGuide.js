import Link from "next/link";
import { FaCode, FaLaptopCode, FaServer, FaArrowLeft } from "react-icons/fa";
import styles from "./Home.module.css";

const steps = [
  {
    number: "۰۱",
    title: "پایه‌های وب را یاد بگیر",
    description:
      "با HTML و CSS ساختار و ظاهر صفحه را بساز. بعد با JavaScript به آن رفتار و تعامل اضافه کن.",
    icon: FaCode,
    tone: "orange",
    topics: [
      { slug: "htmlcss", label: "HTML و CSS" },
      { slug: "javascript", label: "JavaScript" },
    ],
  },
  {
    number: "۰۲",
    title: "رابط‌های کاربردی بساز",
    description:
      "بعد از یادگیری JavaScript، سراغ React برو و ساخت رابط‌های کامل‌تر را با Next.js ادامه بده.",
    icon: FaLaptopCode,
    tone: "blue",
    topics: [
      { slug: "reactjs", label: "React" },
      { slug: "nextjs", label: "Next.js" },
      { slug: "typescript", label: "TypeScript" },
    ],
  },
  {
    number: "۰۳",
    title: "پروژه‌ات را کامل‌تر کن",
    description:
      "با Node.js منطق سمت سرور را یاد بگیر و با Git و Docker، مدیریت و اجرای پروژه را تمرین کن.",
    icon: FaServer,
    tone: "purple",
    topics: [
      { slug: "nodejs", label: "Node.js" },
      { slug: "gitgithub", label: "Git و GitHub" },
      { slug: "docker", label: "Docker" },
    ],
  },
];

export default function HomeLearningGuide({ courses }) {
  const bySlug = new Map(courses.map((course) => [course.slug, course]));
  return (
    <section
      id="learning-guide"
      className={`${styles.container} ${styles.section}`}
      aria-labelledby="guide-title"
    >
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>قدم بعدی‌ات را پیدا کن</p>
          <h2 id="guide-title" className="sectionTitle">
            از کجا شروع کنم؟
          </h2>
          <p className={styles.sectionDescription}>
            یک مسیر پیشنهادی برای یادگیری توسعهٔ وب؛ از مفاهیم پایه تا ساختن یک
            پروژهٔ کامل.
          </p>
        </div>
      </div>
      <div className={styles.threeColumns}>
        {steps.map(({ icon: Icon, ...step }) => {
          const topics = step.topics.filter((topic) => bySlug.has(topic.slug));
          return (
            <article key={step.number} className={styles.pathCard}>
              <div className={styles.pathTop}>
                <span className={`${styles.featureIcon} ${styles[step.tone]}`}>
                  <Icon aria-hidden="true" />
                </span>
                <span className={styles.stepNumber}>{step.number}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <div className={styles.topicLinks}>
                {topics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/course/${bySlug.get(topic.slug).slug}`}
                  >
                    {topic.label}
                    {bySlug.get(topic.slug).isFree && <span>رایگان</span>}
                  </Link>
                ))}
              </div>
              <Link
                className={styles.textLink}
                href={
                  topics.length
                    ? `/course/${bySlug.get(topics[0].slug).slug}`
                    : "/courses"
                }
              >
                شروع این مرحله <FaArrowLeft aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
