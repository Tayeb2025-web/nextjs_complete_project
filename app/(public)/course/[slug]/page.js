import CourseIntro from "@/components/sections/course/CourseIntro";
import connectMongo from "@/configs/connectDB";
import Course from "@/models/Course";
import styles from "./page.module.css";
import { notFound } from "next/navigation";
import CourseDescription from "@/components/sections/course/CourseDescription";
import CourseChapter from "@/components/sections/course/CourseChapter";
import CourseComments from "@/components/sections/course/CourseComments";
import Comment from "@/models/Comment";
import "@/models/User";

const CourseDetails = async ({ params }) => {
  const { slug } = await params;
  await connectMongo();
  const course = await Course.findOne({ slug }).lean();

  if (!course) {
    return notFound();
  }

  // گرفتن کامنت‌های تأیید شده جداگانه
  const comments = await Comment.find({ course: course._id, isApproved: true })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .lean();


  // تبدیل اعداد فارسی و عربی به انگلیسی
  const toEnglishDigits = (str) => {
    if (!str) return "";
    return str
      .toString()
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
      .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
  };

  // محاسبه مدت زمان کل دوره
  const calculateTotalDuration = (chapters, fallback = "") => {
    let totalSeconds = 0;

    if (Array.isArray(chapters)) {
      chapters.forEach((chapter) => {
        if (!Array.isArray(chapter.lessons)) return;
        chapter.lessons.forEach((lesson) => {
          if (!lesson.duration) return;

          const cleaned = toEnglishDigits(lesson.duration).trim();
          // جدا کردن بر اساس : یا . یا کولن تمام‌عرض
          const parts = cleaned.replace(/[^0-9:.:]/g, "").split(/[:.]/);

          let seconds = 0;
          if (parts.length === 3) {
            // فرمت HH:MM:SS
            const hours = parseInt(parts[0], 10) || 0;
            const minutes = parseInt(parts[1], 10) || 0;
            const secs = parseInt(parts[2], 10) || 0;
            seconds = hours * 3600 + minutes * 60 + secs;
          } else if (parts.length === 2) {
            // فرمت MM:SS
            const minutes = parseInt(parts[0], 10) || 0;
            const secs = parseInt(parts[1], 10) || 0;
            seconds = minutes * 60 + secs;
          } else if (parts.length === 1 && parts[0]) {
            // فقط دقیقه
            const minutes = parseInt(parts[0], 10) || 0;
            seconds = minutes * 60;
          }

          totalSeconds += seconds;
        });
      });
    }

    if (totalSeconds === 0 && fallback) {
      return fallback;
    }

    // تبدیل به فرمت خوانا
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours} ساعت${minutes > 0 ? ` و ${minutes} دقیقه` : ""}`;
    } else if (minutes > 0) {
      return `${minutes} دقیقه${secs > 0 ? ` و ${secs} ثانیه` : ""}`;
    } else if (secs > 0) {
      return `${secs} ثانیه`;
    } else {
      return "۰ ثانیه";
    }
  };

  const totalDuration = calculateTotalDuration(course.chapters, course.totalDuration);
  const totalLessons = course.lessonsCount;

  const statusText = course.status === "published" ? "منتشر شده" : course.status === 'coming-soon' ? 'به زودی' : 'پیش نویس'
  const levelText = course.level === "beginner" ? "مبتدی" : course.level === 'intermediate' ? 'متوسط' : 'پیشرفته'
  
  const plainCourse = JSON.parse(JSON.stringify(course));
  const plainComments = JSON.parse(JSON.stringify(comments));

  return (
    <div className={styles.container}>
      <div className={styles.courseDetailsPage}>
        <CourseIntro
          totalDuration={totalDuration}
          totalLessons={totalLessons}
          statusText={statusText}
          levelText={levelText}
          course={plainCourse}
        />
        <CourseDescription fullDescription={course.fullDescription}/>
        <CourseChapter course={plainCourse} />
        <CourseComments course={plainCourse} comments={plainComments} />
      </div>
    </div>
  );
};

export default CourseDetails;
