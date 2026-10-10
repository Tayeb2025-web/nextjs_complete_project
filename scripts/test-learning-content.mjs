import assert from "node:assert/strict";
import { registerHooks, createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      let target = path.join(root, specifier.slice(2));
      if (!existsSync(target)) target += ".js";
      return nextResolve(pathToFileURL(target).href, context);
    }
    if (specifier === "next/server")
      return nextResolve(
        pathToFileURL(require.resolve("next/server")).href,
        context,
      );
    return nextResolve(specifier, context);
  },
});

const originalUrl = process.env.MONGO_URL;
if (!originalUrl)
  throw new Error("MONGO_URL is required for isolated database tests.");
const testDb = "codex_learning_test_" + Date.now();
const connectionParts = originalUrl.match(
  /^(mongodb(?:\+srv)?:\/\/[^\s/?]+)(?:\/[^?]*)?(\?.*)?$/,
);
if (!connectionParts) throw new Error("MongoDB connection format is invalid.");
process.env.MONGO_URL =
  connectionParts[1] + "/" + testDb + (connectionParts[2] || "");
process.env.ACCESS_TOKEN_SECRET = "learning-tests-only-secret";
const { NextRequest } = await import("next/server");
const { default: connectMongo } = await import("../configs/connectDB.js");
const { default: Exercise } = await import("../models/Exercise.js");
const { default: Article } = await import("../models/Article.js");
const { default: Progress } = await import("../models/ExerciseProgress.js");
const { default: User } = await import("../models/User.js");
const { default: Course } = await import("../models/Course.js");
const exerciseAdmin = await import("../app/api/admin/exercises/route.js");
const exerciseItem = await import("../app/api/admin/exercises/[id]/route.js");
const articleAdmin = await import("../app/api/admin/articles/route.js");
const articleItem = await import("../app/api/admin/articles/[id]/route.js");
const publicExercises = await import("../app/api/exercises/route.js");
const publicArticles = await import("../app/api/articles/route.js");
const progressList = await import("../app/api/profile/exercises/route.js");
const progressItem = await import("../app/api/profile/exercises/[id]/route.js");
const { validateLearningContent } =
  await import("../utils/contentValidation.js");
const { sanitizeArticle, articleHeadings } =
  await import("../utils/learningText.js");
const { starterExercises, starterArticles } =
  await import("../configs/learningStarterContent.js");

let passed = 0;
const check = async (name, action) => {
  await action();
  passed++;
  console.log("PASS " + name);
};
const token = (user, role = user.role) =>
  jwt.sign(
    { userId: String(user._id), role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10m" },
  );
const request = (method = "GET", body, user, raw = false) =>
  new NextRequest("http://localhost/api/test", {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(user ? { cookie: "accessToken=" + token(user) } : {}),
    },
    ...(body !== undefined ? { body: raw ? body : JSON.stringify(body) } : {}),
  });
const context = (id) => ({ params: Promise.resolve({ id: String(id) }) });
const exerciseData = {
  ...starterExercises[2],
  slug: "test-even-numbers",
  relatedCourse: null,
};
const articleData = {
  ...starterArticles[1],
  slug: "test-article",
  relatedCourse: null,
};
let exerciseId, articleId;
try {
  await connectMongo();
  assert.equal(mongoose.connection.name, testDb);
  await Promise.all([
    Exercise.init(),
    Article.init(),
    Progress.init(),
    User.init(),
  ]);
  const [admin, student, other] = await User.create([
    {
      email: "admin@example.test",
      name: "مدیر آزمون",
      role: "admin",
      isVerified: true,
    },
    { email: "student@example.test", name: "دانشجوی آزمون", isVerified: true },
    { email: "other@example.test", name: "دانشجوی دوم", isVerified: true },
  ]);
  await check("starter content passes server validation", () => {
    for (const item of starterExercises)
      assert.ok(!validateLearningContent(item, "exercise").error, item.slug);
    for (const item of starterArticles)
      assert.ok(!validateLearningContent(item, "article").error, item.slug);
  });
  await check("admin routes reject anonymous and student writes", async () => {
    assert.equal((await exerciseAdmin.GET(request())).status, 401);
    assert.equal(
      (await exerciseAdmin.POST(request("POST", exerciseData, student))).status,
      403,
    );
    assert.equal(
      (await articleAdmin.POST(request("POST", articleData))).status,
      401,
    );
  });
  await check("invalid slugs and unexpected types are rejected", async () => {
    assert.equal(
      (
        await exerciseAdmin.POST(
          request("POST", { ...exerciseData, slug: { $ne: "" } }, admin),
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await exerciseAdmin.POST(
          request("POST", { ...exerciseData, level: "expert" }, admin),
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await exerciseAdmin.POST(
          request("POST", { ...exerciseData, minutes: "" }, admin),
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await exerciseAdmin.POST(
          request("POST", { ...exerciseData, minutes: 1.5 }, admin),
        )
      ).status,
      400,
    );
  });
  await check(
    "published exercise needs a solution and bounded hints/examples",
    async () => {
      assert.equal(
        (
          await exerciseAdmin.POST(
            request("POST", { ...exerciseData, solution: "" }, admin),
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await exerciseAdmin.POST(
            request(
              "POST",
              { ...exerciseData, hints: Array(6).fill("راهنمایی") },
              admin,
            ),
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await exerciseAdmin.POST(
            request(
              "POST",
              { ...exerciseData, examples: [{ input: {}, output: "" }] },
              admin,
            ),
          )
        ).status,
        400,
      );
    },
  );
  await check("nonexistent related course is rejected", async () => {
    assert.equal(
      (
        await exerciseAdmin.POST(
          request(
            "POST",
            {
              ...exerciseData,
              relatedCourse: String(new mongoose.Types.ObjectId()),
            },
            admin,
          ),
        )
      ).status,
      400,
    );
  });
  await check(
    "draft creation strips client-owned id and timestamps",
    async () => {
      const suppliedId = String(new mongoose.Types.ObjectId());
      const res = await exerciseAdmin.POST(
        request(
          "POST",
          {
            ...exerciseData,
            status: "draft",
            _id: suppliedId,
            createdAt: "2000-01-01",
          },
          admin,
        ),
      );
      assert.equal(res.status, 201);
      const { item } = await res.json();
      exerciseId = item._id;
      assert.notEqual(item._id, suppliedId);
      assert.notEqual(item.createdAt.slice(0, 4), "2000");
      assert.ok(!item.courseSlug);
    },
  );
  await check("public list excludes drafts", async () => {
    assert.equal((await (await publicExercises.GET()).json()).items.length, 0);
  });
  await check(
    "published update and public summary exclude solution",
    async () => {
      const res = await exerciseItem.PUT(
        request("PUT", exerciseData, admin),
        context(exerciseId),
      );
      assert.equal(res.status, 200);
      const items = (await (await publicExercises.GET()).json()).items;
      assert.equal(items.length, 1);
      assert.equal(items[0]._id, exerciseId);
      assert.ok(!("solution" in items[0]));
      assert.ok(!("hints" in items[0]));
    },
  );
  await check("duplicate slug returns conflict", async () => {
    assert.equal(
      (await exerciseAdmin.POST(request("POST", exerciseData, admin))).status,
      409,
    );
  });
  await check("invalid ids and missing updates return 400/404", async () => {
    assert.equal(
      (
        await exerciseItem.PUT(
          request("PUT", exerciseData, admin),
          context("invalid"),
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await exerciseItem.PUT(
          request("PUT", exerciseData, admin),
          context(new mongoose.Types.ObjectId()),
        )
      ).status,
      404,
    );
  });
  await check("progress endpoints require authentication", async () => {
    assert.equal((await progressList.GET(request())).status, 401);
    assert.equal(
      (
        await progressItem.PUT(
          request("PUT", { completed: true }),
          context(exerciseId),
        )
      ).status,
      401,
    );
  });
  await check("progress requires boolean and published target", async () => {
    assert.equal(
      (
        await progressItem.PUT(
          request("PUT", { completed: "true" }, student),
          context(exerciseId),
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await progressItem.PUT(
          request("PUT", { completed: true }, student),
          context(new mongoose.Types.ObjectId()),
        )
      ).status,
      404,
    );
  });
  await check(
    "completion belongs to signed-in user, ignoring body user id",
    async () => {
      const res = await progressItem.PUT(
        request("PUT", { completed: true, user: String(other._id) }, student),
        context(exerciseId),
      );
      assert.equal(res.status, 200);
      assert.match(res.headers.get("cache-control"), /private.*no-store/);
      assert.equal(
        await Progress.countDocuments({
          user: student._id,
          exercise: exerciseId,
        }),
        1,
      );
      assert.equal(await Progress.countDocuments({ user: other._id }), 0);
    },
  );
  await check("completion is idempotent", async () => {
    await Promise.all(
      [1, 2].map(() =>
        progressItem.PUT(
          request("PUT", { completed: true }, student),
          context(exerciseId),
        ),
      ),
    );
    assert.equal(
      await Progress.countDocuments({
        user: student._id,
        exercise: exerciseId,
      }),
      1,
    );
  });
  await check("users only see their own saved progress", async () => {
    const own = await (
      await progressList.GET(request("GET", undefined, student))
    ).json();
    const otherProgress = await (
      await progressList.GET(request("GET", undefined, other))
    ).json();
    assert.deepEqual(own.completedIds, [exerciseId]);
    assert.deepEqual(otherProgress.completedIds, []);
  });
  await check("unmarking completion removes persisted state", async () => {
    assert.equal(
      (
        await progressItem.PUT(
          request("PUT", { completed: false }, student),
          context(exerciseId),
        )
      ).status,
      200,
    );
    assert.equal(await Progress.countDocuments({ user: student._id }), 0);
  });
  await check(
    "unpublished exercises cannot be completed and disappear from progress",
    async () => {
      await Progress.create({ user: student._id, exercise: exerciseId });
      await Exercise.findByIdAndUpdate(exerciseId, { status: "draft" });
      assert.equal(
        (
          await progressItem.PUT(
            request("PUT", { completed: true }, student),
            context(exerciseId),
          )
        ).status,
        404,
      );
      assert.deepEqual(
        (
          await (
            await progressList.GET(request("GET", undefined, student))
          ).json()
        ).completedIds,
        [],
      );
      await Exercise.findByIdAndUpdate(exerciseId, { status: "published" });
    },
  );
  await check(
    "article HTML strips unsafe tags, attributes and URLs",
    async () => {
      const content =
        '<h2 onclick="alert(1)">عنوان آموزشی</h2><p>این یک متن آموزشی کافی برای آزمون ذخیرهٔ مقاله است.</p><script>alert(1)</script><iframe src="https://example.com"></iframe><a href="javascript:alert(1)">لینک</a>';
      const res = await articleAdmin.POST(
        request("POST", { ...articleData, content }, admin),
      );
      assert.equal(res.status, 201);
      const { item } = await res.json();
      articleId = item._id;
      assert.ok(!/script|iframe|onclick|javascript:/i.test(item.content));
      assert.match(item.content, /id="section-1"/);
      assert.ok(item.minutes >= 1);
      assert.equal(articleHeadings(item.content).length, 1);
    },
  );
  await check("public article list is summary-only", async () => {
    const items = (await (await publicArticles.GET()).json()).items;
    assert.equal(items.length, 1);
    assert.ok(!("content" in items[0]));
  });
  await check("empty article after sanitization is rejected", async () => {
    assert.equal(
      (
        await articleAdmin.POST(
          request(
            "POST",
            {
              ...articleData,
              slug: "bad-article",
              content: "<script>12345</script>",
            },
            admin,
          ),
        )
      ).status,
      400,
    );
  });
  await check("article can be moved to draft and edited", async () => {
    assert.equal(
      (
        await articleItem.PUT(
          request("PUT", { ...articleData, status: "draft" }, admin),
          context(articleId),
        )
      ).status,
      200,
    );
    assert.equal((await (await publicArticles.GET()).json()).items.length, 0);
  });
  await check(
    "admin list supplies course choices and private headers",
    async () => {
      const res = await exerciseAdmin.GET(request("GET", undefined, admin));
      assert.equal(res.status, 200);
      assert.match(res.headers.get("cache-control"), /private/);
      const data = await res.json();
      assert.equal(data.items.length, 1);
      assert.ok(Array.isArray(data.courses));
    },
  );
  await check("malformed JSON returns a validation error", async () => {
    assert.equal(
      (await exerciseAdmin.POST(request("POST", "{", admin, true))).status,
      400,
    );
    assert.equal(
      (
        await progressItem.PUT(
          request("PUT", "{", student, true),
          context(exerciseId),
        )
      ).status,
      400,
    );
  });
  await check(
    "published course links are hydrated, then hidden when course becomes draft",
    async () => {
      const course = await Course.create({
        title: "دورهٔ آزمون",
        slug: "test-course",
        shortDescription: "دورهٔ اختصاصی آزمون",
        fullDescription: "<p>متن</p>",
        price: 0,
        isFree: true,
        status: "published",
      });
      assert.equal(
        (
          await exerciseItem.PUT(
            request(
              "PUT",
              { ...exerciseData, relatedCourse: String(course._id) },
              admin,
            ),
            context(exerciseId),
          )
        ).status,
        200,
      );
      let item = (await (await publicExercises.GET()).json()).items[0];
      assert.equal(item.relatedCourse.slug, course.slug);
      await Course.findByIdAndUpdate(course._id, { status: "draft" });
      item = (await (await publicExercises.GET()).json()).items[0];
      assert.equal(item.relatedCourse, null);
    },
  );
  await check("HTML sanitization is safe when repeated for display", () => {
    const content = sanitizeArticle(
      '<h2>اول</h2><h3>دوم</h3><a href="//evil.test">متن</a>',
    );
    assert.equal(sanitizeArticle(content), content);
    assert.ok(!content.includes('href="//'));
    assert.deepEqual(
      articleHeadings(content).map((h) => h.id),
      ["section-1", "section-2"],
    );
  });
  await check("exercise deletion clears progress", async () => {
    assert.equal(
      (
        await exerciseItem.DELETE(
          request("DELETE", undefined, admin),
          context(exerciseId),
        )
      ).status,
      200,
    );
    assert.equal(await Progress.countDocuments({ exercise: exerciseId }), 0);
    assert.equal(
      (
        await exerciseItem.DELETE(
          request("DELETE", undefined, admin),
          context(exerciseId),
        )
      ).status,
      404,
    );
  });
  await check("article deletion and role enforcement", async () => {
    assert.equal(
      (
        await articleItem.DELETE(
          request("DELETE", undefined, student),
          context(articleId),
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await articleItem.DELETE(
          request("DELETE", undefined, admin),
          context(articleId),
        )
      ).status,
      200,
    );
  });
  await check("initial pure JavaScript solutions match their examples", () => {
    const bySlug = (slug) =>
      starterExercises.find((item) => item.slug === slug).solution;
    const even = new Function(
      bySlug("even-numbers") + ";return getEvenNumbers;",
    )();
    const input = [-3, -2, 0, 5];
    assert.deepEqual(even(input), [-2, 0]);
    assert.deepEqual(input, [-3, -2, 0, 5]);
    assert.deepEqual(even([]), []);
    const total = new Function(bySlug("cart-total") + ";return cartTotal;")();
    assert.equal(
      total([
        { price: 100, quantity: 2 },
        { price: 50, quantity: 3 },
      ]),
      350,
    );
    assert.equal(total([]), 0);
    const words = new Function(
      bySlug("word-frequency") + ";return wordFrequency;",
    )();
    assert.deepEqual({ ...words("Code learn code") }, { code: 2, learn: 1 });
    assert.deepEqual({ ...words("   ") }, {});
    assert.deepEqual(
      { ...words("constructor constructor") },
      { constructor: 2 },
    );
  });
  await check("debounce preserves latest arguments and context", async () => {
    const code = starterExercises.find(
      (item) => item.slug === "javascript-debounce",
    ).solution;
    const debounce = new Function(code + ";return debounce;")();
    const results = [];
    const owner = { id: 7 };
    const fn = debounce(function (value) {
      results.push([this.id, value]);
    }, 20);
    fn.call(owner, "a");
    fn.call(owner, "abc");
    await new Promise((resolve) => setTimeout(resolve, 45));
    assert.deepEqual(results, [[7, "abc"]]);
  });
  console.log(
    "Completed " + passed + " checks in an isolated temporary database.",
  );
} catch (error) {
  console.error(
    "FAIL:",
    String(error.message).replace(
      /mongodb(?:\+srv)?:\/\/[^\s]+/g,
      "[redacted connection]",
    ),
  );
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState === 1) {
    assert.equal(mongoose.connection.name, testDb);
    assert.ok(testDb.startsWith("codex_learning_test_"));
    await mongoose.connection.dropDatabase();
    console.log("Temporary test database removed.");
  }
  await mongoose.disconnect();
}
