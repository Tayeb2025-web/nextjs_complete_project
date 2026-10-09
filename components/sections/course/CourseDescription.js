import styles from "./CourseDescription.module.css";
import sanitizeHtml from "sanitize-html";

export default function CourseDescription({ fullDescription }) {
  // Sanitize HTML از CKEditor — جلوگیری از XSS
  const cleanHtml = sanitizeHtml(fullDescription, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
      a: ["href", "target", "rel"],
    },
    selfClosing: ["img", "br", "hr"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  });
  return (
    <section className={`section ${styles.description}`}>
      <h2 className={styles.descriptionTitle}>توضیحات کامل دوره</h2>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </section>
  );
}
