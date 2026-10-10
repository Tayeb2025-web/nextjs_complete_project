import connectMongo from "@/configs/connectDB";
import Course from "@/models/Course";
import { isAdmin } from "@/utils/auth";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { resolveCourseCategory } from "@/utils/courseCategory";
import { validateCoursePricing } from "@/utils/coursePrice";

export async function POST(req) {
  try {
    await connectMongo();

    // admin check
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    // form data parse
    const formData = await req.formData();

    const title = formData.get("title");
    const shortDescription = formData.get("shortDescription");
    const fullDescription = formData.get("fullDescription");
    const price = formData.get("price");
    const discountPrice = formData.get("discountPrice");
    const isFree = formData.get("isFree") === "true";
    const level = formData.get("level") || "beginner";
    const status = formData.get("status") || "draft";
    const slug = formData.get("slug");
    const thumbnail = formData.get("thumbnail");
    const chaptersJson = formData.get("chapters");

    const pricing = validateCoursePricing({ price, discountPrice, isFree });
    if (pricing.error) return NextResponse.json({ success: false, message: pricing.error }, { status: 400 });
    const categoryResult = await resolveCourseCategory(formData.get("category"));
    if (categoryResult.error) return NextResponse.json({ success: false, message: categoryResult.error }, { status: 400 });

    // from data validation
    if (!title || title.length < 5) {
      return NextResponse.json(
        { sucess: false, message: "عنوان دوره حداقل ۵ کاراکتر باید باشد" },
        { status: 400 },
      );
    }

    if (!fullDescription || fullDescription.length < 50) {
      return NextResponse.json(
        { sucess: false, message: "توضیحات کامل حداقل ۵۰ کاراکتر باید باشد" },
        { status: 400 },
      );
    }

    if (!thumbnail || !(thumbnail instanceof File)) {
      return NextResponse.json(
        { success: false, message: "تصویر کاور الزامی است" },
        { status: 400 },
      );
    }

    // 4.Chapters Parse And Validation =========================
    let chapters = [];
    if (chaptersJson) {
      try {
        chapters = JSON.parse(chaptersJson.toString());
        if (!Array.isArray(chapters) || chapters.length === 0) {
          return NextResponse.json(
            { message: "حداقل یک فصل لازم است" },
            { status: 400 },
          );
        }
        for (const chapter of chapters) {
          if (!chapter.title?.trim()) {
            return NextResponse.json(
              { message: "عنوان هر فصل الزامی است" },
              { status: 400 },
            );
          }
          if (!Array.isArray(chapter.lessons) || chapter.lessons.length === 0) {
            return NextResponse.json(
              { message: "هر فصل حداقل یک درس نیاز دارد" },
              { status: 400 },
            );
          }
          for (const les of chapter.lessons) {
            if (!les.title?.trim()) {
              return NextResponse.json(
                { message: "عنوان هر درس الزامی است" },
                { status: 400 },
              );
            }
            if (!les.duration?.trim()) {
              return NextResponse.json(
                { message: "مدت زمان هر درس الزامی است" },
                { status: 400 },
              );
            }
          }
        }
      } catch (err) {
        return NextResponse.json(
          { message: "فرمت فصل‌ها و درس‌ها نامعتبر است" },
          { status: 400 },
        );
      }
    }

    // slug validation
    if (!slug) {
      return NextResponse.json(
        { sucess: false, message: "slug معتبر وارد کنید" },
        { status: 400 },
      );
    }

    const existingSlug = await Course.findOne({ slug });
    if (existingSlug) {
      return NextResponse.json(
        {
          sucess: false,
          message: `slug "${slug}" قبلاً استفاده شده است. لطفاً slug دیگری انتخاب کنید.`,
        },
        { status: 400 },
      );
    }

    const { url: imageUrl } = await put(
      `courses/${thumbnail.name}`,
      thumbnail,
      {
        access: "public",
        addRandomSuffix: true,
      },
    );

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

    // Save Course
    const newCourse = new Course({
      title,
      slug,
      shortDescription,
      fullDescription,
      price: pricing.price,
      discountPrice: pricing.discountPrice,
      category: categoryResult.category,
      isFree,
      level,
      status,
      thumbnail: imageUrl,
      chapters,
      lessonsCount: chapters.reduce((sum, ch) => sum + ch.lessons.length, 0),
    });

    await newCourse.save();

    return NextResponse.json(
      {
        success: true,
        message: "دوره با موفقیت اضافه شد!",
        course: newCourse,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { sucess: false, message: error.message },
      { status: 500 },
    );
  }
}

// /api/admin/course/add
