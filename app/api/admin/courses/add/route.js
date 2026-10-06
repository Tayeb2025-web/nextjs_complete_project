import connectMongo from "@/configs/connectDB";
import Course from "@/models/Course";
import { isAdmin } from "@/utils/auth";
import { NextResponse } from "next/server";
import path from "path";
import { writeFile , mkdir } from "fs/promises";

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

    if(!thumbnail || !(thumbnail instanceof File)) {
        return NextResponse.json(
            {success:false , message: "تصویر کاور الزامی است"} , 
            {status : 400}
        )
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

    const bytes = await thumbnail.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${path.extname(thumbnail.name)}`;
    const uploadDir = path.join(process.cwd(), "public", "images", "courses");

    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    const imageUrl = `/images/courses/${filename}`;

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
      price: isFree ? 0 : Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      isFree,
      level,
      status,
      thumbnail: imageUrl ,
      chapters ,
      lessonsCount: chapters.reduce((sum,ch)=> sum + ch.lessons.length , 0)
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
      { sucess: false, message: "خطای سرور — لطفاً دوباره تلاش کنید" },
      { status: 500 },
    );
  }
}

// /api/admin/course/add