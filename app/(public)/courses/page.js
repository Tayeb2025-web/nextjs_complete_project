"use client";

import { useEffect, useState } from "react";
import CourseCard from "@/components/ui/CourseCard";
import styles from "./Courses.module.css";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses/latests?limit=100");
        if (!res.ok) throw new Error();

        const data = await res.json();
        setCourses(data.courses || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="container section">
      <div className="sectionHeader">
        <p className="sectionTitle">دوره های آموزشی</p>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <p>در حال بارگذاری دوره ها...</p>
        </div>
      ) : courses.length > 0 ? (
        <div className={styles.coursesGrid}>
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyBox}>
          <p>هیچ دوره ای یافت نشد</p>
        </div>
      )}
    </div>
  );
}
