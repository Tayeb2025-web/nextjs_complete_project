"use client";
import LearningError from "@/components/shared/learning/LearningError";
export default function ErrorPage({ retry }) {
  return <LearningError retry={retry} />;
}
