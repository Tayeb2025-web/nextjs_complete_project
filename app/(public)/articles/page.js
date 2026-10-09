import LearningCatalog from "@/components/shared/learning/LearningCatalog";
export const metadata = {
  title: "مقالات آموزشی",
  description: "آموزش‌های متنی برنامه‌نویسی و راهنمای ادامهٔ یادگیری.",
};
export default function Articles() {
  return <LearningCatalog type="article" />;
}
