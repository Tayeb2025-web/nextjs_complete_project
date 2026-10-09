import connectMongo from "@/configs/connectDB";
import Course from "@/models/Course";
import { isAdmin } from "@/utils/auth";
import { NextResponse } from "next/server";
import path from 'path'
import {writeFile , mkdir} from 'fs/promises'
import { resolveCourseCategory } from "@/utils/courseCategory";
import { validateCoursePricing } from "@/utils/coursePrice";

export async function GET(req, { params }) {
  try {
    await connectMongo();

    //admin check ==========================
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    //slug check ==========================
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { success: false, message: "slug is required" },
        { status: 400 },
      );
    }

    //find course ==========================
    const course = await Course.findOne({ slug });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "course nout found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, course }, { status: 200 });
  } catch (err) {
    console.error("Error fetching course for edit:", err.message);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
}


export async function DELETE(req, { params }) {
  try {
    await connectMongo();

    // 1.admin check ==========================
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    //slug check ==========================
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "slug is required" },
        { status: 400 },
      );
    }

    const result = await Course.deleteOne({ slug });

    if (result.deletedCount == 0) {
      return NextResponse.json(
        { success: false, message: "course not found" },
        { status: 404 },
      );
    } else {
      return NextResponse.json(
        { success: true, message: "course deleted successfully" },
        { status: 200 },
      );
    }
  } catch (err) {
    console.error("Error fetching course for edit:", err);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectMongo();

    //Admin Check ==========================
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    const { slug: urlSlug } = await params;
    if (!urlSlug) {
      return NextResponse.json(
        { success: false, message: "اِسلاگ معتبر نیست" },
        { status: 400 },
      );
    }
    const course = await Course.findOne({ slug: urlSlug });
    if (!course)
      return NextResponse.json(
        { success: false, message: "دوره یافت نشد" },
        { status: 404 },
      );

    // Get Data =============================
    const formData = await req.formData();
    const title = formData.get("title");
    const shortDescription = formData.get("shortDescription");
    const fullDescription = formData.get("fullDescription");
    const price = formData.get("price");
    const discountPrice = formData.get("discountPrice");
    const isFree = formData.get("isFree") === "true";
    const level = formData.get("level") || "beginner";
    const status = formData.get("status") || "draft";
    const updatedSlug = formData.get("slug");
    const thumbnail = formData.get("thumbnail");
    const chaptersJson = formData.get("chapters");

    const pricing = validateCoursePricing({ price, discountPrice, isFree });
    if (pricing.error) return NextResponse.json({ success: false, message: pricing.error }, { status: 400 });
    const categoryResult = formData.has("category")
      ? await resolveCourseCategory(formData.get("category"), course.category)
      : { category: course.category || null };
    if (categoryResult.error) return NextResponse.json({ success: false, message: categoryResult.error }, { status: 400 });

    // Simple Form Data Validation ===================
    if (!title || title.length < 5) {
      return NextResponse.json(
        { success: false, message: "عنوان دوره حداقل ۵ کاراکتر باید باشد" },
        { status: 400 },
      );
    }

    if (!fullDescription || fullDescription.length < 50) {
      return NextResponse.json(
        { success: false, message: "توضیحات کامل حداقل ۵۰ کاراکتر باید باشد" },
        { status: 400 },
      );
    }

    // Chapters Parse And Validation =========================
    let chapters = [];
    if (chaptersJson) {
      try {
        chapters = JSON.parse(chaptersJson.toString());
        if (!Array.isArray(chapters) || chapters.length === 0) {
          return NextResponse.json(
            { success: false, message: "حداقل یک فصل لازم است" },
            { status: 400 },
          );
        }
        for (const chapter of chapters) {
          if (!chapter.title?.trim()) {
            return NextResponse.json(
              { success: false, message: "عنوان هر فصل الزامی است" },
              { status: 400 },
            );
          }
          if (!Array.isArray(chapter.lessons) || chapter.lessons.length === 0) {
            return NextResponse.json(
              { success: false, message: "هر فصل حداقل یک درس نیاز دارد" },
              { status: 400 },
            );
          }
          for (const les of chapter.lessons) {
            if (!les.title?.trim()) {
              return NextResponse.json(
                { success: false, message: "عنوان هر درس الزامی است" },
                { status: 400 },
              );
            }
            if (!les.duration?.trim()) {
              return NextResponse.json(
                { success: false, message: "مدت زمان هر درس الزامی است" },
                { status: 400 },
              );
            }
          }
        }
      } catch (err) {
        return NextResponse.json(
          { success: false, message: "فرمت فصل‌ها و درس‌ها نامعتبر است" },
          { status: 400 },
        );
      }
    }

    // Check slug is uniqe or not =========================
    if (updatedSlug != urlSlug) {
      const existingSlug = await Course.findOne({ slug: updatedSlug });
      if (existingSlug) {
        return NextResponse.json(
          {
            success: false,
            message: `اسلاگ "${updatedSlug}" قبلاً استفاده شده است. لطفاً slug دیگری انتخاب کنید.`,
          },
          { status: 400 },
        );
      }
    }

    // New Image Upload =========================
    let imageUrl = course.thumbnail;

    if (thumbnail && thumbnail instanceof File) {
      const bytes = await thumbnail.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}${path.extname(thumbnail.name)}`;

      const uploadDir = path.join(process.cwd(), "public", "images", "courses");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      imageUrl = `/images/courses/${filename}`;
    }

    // اگر دوره رایگان باشد، همه درس‌های آن رایگان شوند
    if (isFree && Array.isArray(chapters)) {
      chapters.forEach((ch) => {
        if (Array.isArray(ch.lessons)) {
          ch.lessons.forEach((les) => {
            les.isFree = true;
          });
        }
      });
    }

    // Course Update Information=================
    course.title = title;
    course.slug = updatedSlug;
    course.shortDescription = shortDescription;
    course.fullDescription = fullDescription;
    course.price = pricing.price;
    course.discountPrice = pricing.discountPrice;
    course.category = categoryResult.category;
    course.isFree = isFree;
    course.level = level;
    course.status = status;
    course.thumbnail = imageUrl;
    course.chapters = chapters;
    course.lessonsCount = chapters.reduce(
      (sum, ch) => sum + ch.lessons.length,
      0,
    );

    await course.save();

    return NextResponse.json({
      success: true,
      message: "دوره با موفقیت بروزرسانی شد!",
      course,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({success: false, message: "خطای سرور" }, { status: 500 });
  }
}
