import Link from "next/link";
import { FaArrowLeft, FaRegClock } from "react-icons/fa";
import connectMongo from "@/configs/connectDB";
import Article from "@/models/Article";
import "@/models/Course";
import { notFound } from "next/navigation";
import { sanitizeArticle, articleHeadings } from "@/utils/learningText";
import styles from "@/components/shared/learning/Learning.module.css";

export const metadata = { title: "مقالهٔ آموزشی" };
export default async function ArticlePage({ params }) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();
  await connectMongo();
  const article = await Article.findOne({ slug, status: "published" })
    .populate({
      path: "relatedCourse",
      select: "title slug",
      match: { status: "published" },
    })
    .lean();
  if (!article) notFound();
  const content = sanitizeArticle(article.content);
  const headings = articleHeadings(content);
  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb} aria-label="مسیر صفحه">
        <Link href="/">صفحه اصلی</Link>
        <span>/</span>
        <Link href="/articles">مقالات</Link>
        <span>/</span>
        <span>{article.title}</span>
      </nav>
      <header className={styles.detailHeader}>
        <p className={styles.kicker}>{article.topic}</p>
        <h1>{article.title}</h1>
        <p className={styles.description}>{article.summary}</p>
        <div className={styles.meta}>
          <span>
            <FaRegClock aria-hidden="true" />{" "}
            {article.minutes.toLocaleString("fa-IR")} دقیقه مطالعه
          </span>
          {article.authorName && <span>{article.authorName}</span>}
          <time dateTime={article.createdAt.toISOString()}>
            {article.createdAt.toLocaleDateString("fa-IR")}
          </time>
        </div>
      </header>
      <div className={styles.detailGrid}>
        <div className={styles.mainColumn}>
          <article
            className={[styles.panel, styles.articleBody].join(" ")}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <Link href="/articles" className={styles.backLink}>
            بازگشت به مقالات <FaArrowLeft aria-hidden="true" />
          </Link>
        </div>
        <aside className={styles.sidebar}>
          {headings.length > 0 && (
            <nav className={styles.panel} aria-label="فهرست مقاله">
              <h2>در این مقاله</h2>
              <ul className={styles.toc}>
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={"#" + h.id}>{h.title}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {article.relatedCourse && (
            <section className={styles.related}>
              <p className={styles.kicker}>ادامهٔ یادگیری</p>
              <h2>{article.relatedCourse.title}</h2>
              <p>برای آموزش قدم‌به‌قدم این موضوع، دورهٔ مرتبط را ببین.</p>
              <Link href={"/course/" + article.relatedCourse.slug}>
                مشاهدهٔ دوره <FaArrowLeft aria-hidden="true" />
              </Link>
            </section>
          )}
          <section className={styles.panel}>
            <h2>آموخته‌هایت را تمرین کن</h2>
            <p className={styles.muted}>
              یک تمرین متناسب با سطح خودت انتخاب کن و از خواندن به کدنویسی برس.
            </p>
            <Link className={styles.button} href="/exercises">
              مشاهدهٔ تمرین‌ها
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
