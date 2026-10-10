"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCheck,
  FaCode,
  FaHtml5,
  FaCss3Alt,
  FaReact,
} from "react-icons/fa";
import { SiJavascript, SiNextdotjs, SiTailwindcss } from "react-icons/si";
import { useSiteSettings } from "@/contexts/siteSettingsContext";
import styles from "./Home.module.css";

const technologies = [
  { name: "HTML", Icon: FaHtml5, className: "htmlBubble" },
  { name: "CSS", Icon: FaCss3Alt, className: "cssBubble" },
  { name: "JavaScript", Icon: SiJavascript, className: "jsBubble" },
  { name: "React", Icon: FaReact, className: "reactBubble" },
  { name: "Next.js", Icon: SiNextdotjs, className: "nextBubble" },
  { name: "Tailwind CSS", Icon: SiTailwindcss, className: "tailwindBubble" },
];

function TechnologyBubble({ name, Icon, className }) {
  const [phase, setPhase] = useState("floating");

  useEffect(() => {
    if (phase === "floating") return;

    const timer = setTimeout(
      () => setPhase(phase === "popped" ? "returning" : "floating"),
      phase === "popped" ? 2600 : 450,
    );
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div
      className={`${styles.technologyBubble} ${styles[className]} ${
        phase === "popped"
          ? styles.bubblePopped
          : phase === "returning"
            ? styles.bubbleReturning
            : ""
      }`}
    >
      <button
        type="button"
        className={styles.bubbleButton}
        aria-label={`ترکاندن حباب ${name}`}
        aria-hidden={phase === "popped" ? true : undefined}
        disabled={phase !== "floating"}
        onClick={() => setPhase("popped")}
      >
        <Icon aria-hidden="true" />
      </button>
      <span className={styles.bubbleBurst} aria-hidden="true">
        <span className={styles.burstRing} />
        {Array.from({ length: 6 }, (_, index) => (
          <i key={index} className={styles.burstParticle} />
        ))}
      </span>
    </div>
  );
}

export default function HomeHero() {
  const settings = useSiteSettings();
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={`${styles.container} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <FaCode aria-hidden="true" />
            {settings.siteName}؛ آموزش برنامه‌نویسی
          </p>
          <h1 id="home-title">
            از اولین خط کد،
            <br />
            تا ساختن <span>پروژهٔ خودت.</span>
          </h1>
          <p className={styles.heroDescription}>
            برنامه‌نویسی را قدم‌به‌قدم یاد بگیر. از پایه‌های طراحی وب شروع کن،
            مهارتت را با تمرین بساز و برای یادگیری موضوع‌های پیشرفته‌تر آماده
            شو.
          </p>
          <div className={styles.actions}>
            <Link href="/courses" className={styles.primaryButton}>
              مشاهدهٔ دوره‌ها <FaArrowLeft aria-hidden="true" />
            </Link>
            <a href="#learning-guide" className={styles.secondaryButton}>
              از کجا شروع کنم؟
            </a>
          </div>
          <ul className={styles.heroNotes}>
            <li>
              <FaCheck aria-hidden="true" />
              آموزش به زبان فارسی
            </li>
            <li>
              <FaCheck aria-hidden="true" />
              از مقدماتی تا پیشرفته
            </li>
            <li>
              <FaCheck aria-hidden="true" />
              دوره‌ها در پنل شخصی
            </li>
          </ul>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.editor} aria-hidden="true">
            <div className={styles.editorHeader}>
              <div className={styles.windowDots}>
                <i />
                <i />
                <i />
              </div>
              <span>first-project.js</span>
              <FaCode />
            </div>
            <div className={styles.editorCode} dir="ltr">
              <div>
                <span className={styles.lineNumber}>1</span>
                <code>
                  <b>const</b> developer = {"{"}
                </code>
              </div>
              <div>
                <span className={styles.lineNumber}>2</span>
                <code>
                  {"  "}name: <em>"You"</em>,
                </code>
              </div>
              <div>
                <span className={styles.lineNumber}>3</span>
                <code>
                  {"  "}skills: [<em>"HTML"</em>, <em>"CSS"</em>,{" "}
                  <em>"JavaScript"</em>],
                </code>
              </div>
              <div>
                <span className={styles.lineNumber}>4</span>
                <code>
                  {"  "}nextStep: <em>"Build something!"</em>,
                </code>
              </div>
              <div>
                <span className={styles.lineNumber}>5</span>
                <code>{"}"};</code>
              </div>
              <div>
                <span className={styles.lineNumber}>6</span>
                <code>&nbsp;</code>
              </div>
              <div>
                <span className={styles.lineNumber}>7</span>
                <code>
                  console.<strong>log</strong>(developer.nextStep);
                </code>
              </div>
            </div>
            <div className={styles.editorOutput}>
              <span>OUTPUT</span>
              <p>
                <FaCheck />
                Build something!
              </p>
            </div>
          </div>
          <div className={styles.technologyBubbles}>
            {technologies.map((technology) => (
              <TechnologyBubble key={technology.name} {...technology} />
            ))}
          </div>
          <div className={styles.visualCaption} aria-hidden="true">
            <span className={styles.captionIcon}>
              <FaCode />
            </span>
            <span className={styles.captionText}>
              <span>یاد بگیر،</span> <span>تمرین کن،</span> <span>بساز.</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
