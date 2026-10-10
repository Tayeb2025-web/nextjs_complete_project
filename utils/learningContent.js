import connectMongo from "@/configs/connectDB";
import Exercise from "@/models/Exercise";
import Article from "@/models/Article";
import Course from "@/models/Course";
import ExerciseProgress from "@/models/ExerciseProgress";
import { isAdmin } from "@/utils/auth";
import { isValidId } from "@/utils/adminValidation";
import { validateLearningContent } from "@/utils/contentValidation";
import { NextResponse } from "next/server";

const modelFor = (type) => (type === "exercise" ? Exercise : Article);
const nameFor = (type) => (type === "exercise" ? "تمرین" : "مقاله");
const privateHeaders = { "Cache-Control": "private, no-store" };

function failure(error, fallback) {
  const status =
    error.code === 11000 ? 409 : error instanceof SyntaxError ? 400 : 500;
  return NextResponse.json(
    {
      success: false,
      message:
        status === 409
          ? "این آدرس قبلاً استفاده شده است"
          : status === 400
            ? "اطلاعات ارسالی معتبر نیست"
            : fallback,
    },
    { status },
  );
}

export async function listAdminContent(req, type) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  try {
    await connectMongo();
    const [items, courses] = await Promise.all([
      modelFor(type).find().sort({ createdAt: -1 }).lean(),
      Course.find({ status: "published" })
        .select("title slug")
        .sort({ title: 1 })
        .lean(),
    ]);
    return NextResponse.json(
      { success: true, items, courses },
      { headers: privateHeaders },
    );
  } catch (error) {
    return failure(error, "خطا در دریافت محتوا");
  }
}

export async function saveAdminContent(req, type, id = null) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  if (id !== null && !isValidId(id))
    return NextResponse.json(
      { success: false, message: "شناسه معتبر نیست" },
      { status: 400 },
    );
  try {
    const { value, error } = validateLearningContent(await req.json(), type);
    if (error)
      return NextResponse.json(
        { success: false, message: error },
        { status: 400 },
      );
    await connectMongo();
    if (
      value.relatedCourse &&
      !(await Course.exists({ _id: value.relatedCourse, status: "published" }))
    ) {
      return NextResponse.json(
        { success: false, message: "دورهٔ مرتبط منتشرشده یافت نشد" },
        { status: 400 },
      );
    }
    const Model = modelFor(type);
    const item = id
      ? await Model.findByIdAndUpdate(
          id,
          { $set: value },
          { returnDocument: "after", runValidators: true },
        )
      : await Model.create(value);
    if (!item)
      return NextResponse.json(
        { success: false, message: "محتوا یافت نشد" },
        { status: 404 },
      );
    return NextResponse.json(
      { success: true, item, message: nameFor(type) + " با موفقیت ذخیره شد" },
      { status: id ? 200 : 201, headers: privateHeaders },
    );
  } catch (error) {
    return failure(error, "خطا در ذخیره محتوا");
  }
}

export async function deleteAdminContent(req, type, id) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;
  if (!isValidId(id))
    return NextResponse.json(
      { success: false, message: "شناسه معتبر نیست" },
      { status: 400 },
    );
  try {
    await connectMongo();
    const item = await modelFor(type).findByIdAndDelete(id);
    if (!item)
      return NextResponse.json(
        { success: false, message: "محتوا یافت نشد" },
        { status: 404 },
      );
    if (type === "exercise")
      await ExerciseProgress.deleteMany({ exercise: id });
    return NextResponse.json(
      { success: true, message: nameFor(type) + " حذف شد" },
      { headers: privateHeaders },
    );
  } catch (error) {
    return failure(error, "خطا در حذف محتوا");
  }
}

export async function listPublicContent(type) {
  try {
    await connectMongo();
    const fields =
      type === "exercise"
        ? "title slug summary topic level minutes createdAt relatedCourse"
        : "title slug summary topic authorName minutes createdAt relatedCourse";
    const items = await modelFor(type)
      .find({ status: "published" })
      .select(fields)
      .populate({
        path: "relatedCourse",
        select: "title slug",
        match: { status: "published" },
      })
      .sort({ createdAt: -1, _id: -1 })
      .lean();
    return NextResponse.json(
      { success: true, items },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error, "خطا در دریافت محتوا؛ دوباره تلاش کنید");
  }
}
