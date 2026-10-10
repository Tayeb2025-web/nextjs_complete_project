import mongoose from "mongoose";
import connectMongo from "../configs/connectDB.js";
import Exercise from "../models/Exercise.js";
import Article from "../models/Article.js";
import ExerciseProgress from "../models/ExerciseProgress.js";
import Course from "../models/Course.js";
import {
  starterExercises,
  starterArticles,
} from "../configs/learningStarterContent.js";
import { validateLearningContent } from "../utils/contentValidation.js";

const dryRun = process.argv.includes("--dry-run");
const groups = [
  { type: "exercise", Model: Exercise, items: starterExercises },
  { type: "article", Model: Article, items: starterArticles },
];
try {
  for (const group of groups)
    for (const item of group.items) {
      const result = validateLearningContent(item, group.type);
      if (result.error) throw new Error(item.slug + ": " + result.error);
    }
  if (dryRun) {
    console.log("Validated 8 exercises and 3 articles; no database writes.");
  } else {
    await connectMongo();
    await Promise.all([
      Exercise.init(),
      Article.init(),
      ExerciseProgress.init(),
    ]);
    for (const { type, Model, items } of groups) {
      const operations = [];
      for (const item of items) {
        const course = await Course.findOne({
          slug: item.courseSlug,
          status: "published",
        })
          .select("_id")
          .lean();
        const { value } = validateLearningContent(
          { ...item, relatedCourse: course ? String(course._id) : null },
          type,
        );
        const now = new Date();
        operations.push({
          updateOne: {
            filter: { slug: value.slug },
            update: {
              $setOnInsert: { ...value, createdAt: now, updatedAt: now },
            },
            upsert: true,
            timestamps: false,
          },
        });
      }
      const result = await Model.bulkWrite(operations);
      console.log(
        type +
          ": added " +
          result.upsertedCount +
          ", existing records preserved " +
          (items.length - result.upsertedCount),
      );
    }
  }
} catch (error) {
  console.error(
    "Learning content setup failed:",
    String(error.message).replace(
      /mongodb(?:\+srv)?:\/\/[^\s]+/g,
      "[redacted connection]",
    ),
  );
  process.exitCode = 1;
} finally {
  if (!dryRun) await mongoose.disconnect();
}
