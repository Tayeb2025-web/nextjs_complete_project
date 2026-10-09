import connectMongo from "@/configs/connectDB";
import Exercise from "@/models/Exercise";
import "@/models/Course";
import { notFound } from "next/navigation";
import ExerciseDetails from "@/components/shared/learning/ExerciseDetails";

export const metadata = { title: "تمرین برنامه‌نویسی" };
export default async function ExercisePage({ params }) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();
  await connectMongo();
  const exercise = await Exercise.findOne({ slug, status: "published" })
    .populate({
      path: "relatedCourse",
      select: "title slug",
      match: { status: "published" },
    })
    .lean();
  if (!exercise) notFound();
  return <ExerciseDetails exercise={JSON.parse(JSON.stringify(exercise))} />;
}
