"use client";
import { useEffect, useState } from "react";
import styles from "./LastCourses.module.css";
import CourseCard from "@/components/ui/CourseCard";
import Link from "next/link";

export default function LastCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestCourses = async () => {
      try {
        const res = await fetch("/api/courses/latests");
        // if (!res.ok) throw new Error();

        const data = await res.json();
        console.log(data);
        
        setCourses(data.courses || []);
      } catch (err) {
        console.error("Error fetching latest courses:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestCourses();
  }, []);

  return (
    <div className="container section">
      <div className="sectionHeader">
        <p className="sectionTitle">آخرین دوره های آموزشی</p>
        <Link href='/courses'><p className="sectionMore">همه دوره ها</p></Link>
      </div>
      <div className={styles.lastCourses}>
        {loading ? (
          <p>در حال بارگذاری دوره ها...</p>
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))
        ) : (
          <p>هیچ دوره ای یافت نشد</p>
        )}
      </div>
    </div>
  );
}
