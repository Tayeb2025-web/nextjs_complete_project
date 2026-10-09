import assert from "node:assert/strict";
import { registerHooks, createRequire } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Run each route in a fresh process, without a database or real credentials:
// node scripts/test-admin-orders.mjs list
// node scripts/test-admin-orders.mjs details
const mode = process.argv[2];
assert.ok(["list", "details"].includes(mode));
const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      let target = path.join(root, specifier.slice(2));
      if (!existsSync(target)) target += ".js";
      return nextResolve(pathToFileURL(target).href, context);
    }
    if (specifier === "next/server") {
      return nextResolve(
        pathToFileURL(require.resolve("next/server")).href,
        context,
      );
    }
    return nextResolve(specifier, context);
  },
});

assert.equal(mongoose.models.User, undefined);
assert.equal(mongoose.models.Course, undefined);
const { GET } = await import(
  mode === "list"
    ? "../app/api/admin/orders/route.js"
    : "../app/api/admin/orders/[id]/route.js"
);
const { Order, User, Course } = mongoose.models;
assert.ok(Order && User && Course, "The route must register its own models");
const { NextRequest } = await import("next/server");
delete process.env.MONGO_URL;
process.env.ACCESS_TOKEN_SECRET = "admin-orders-regression-test-only";
const userId = new mongoose.Types.ObjectId();
const courseId = new mongoose.Types.ObjectId();
const orderId = new mongoose.Types.ObjectId();
const context = { params: Promise.resolve({ id: String(orderId) }) };
const request = (role) => {
  const token = role
    ? jwt.sign({ role, userId: String(userId) }, process.env.ACCESS_TOKEN_SECRET)
    : null;
  return new NextRequest("http://localhost/api/admin/orders?page=1", {
    headers: token ? { cookie: `accessToken=${token}` } : {},
  });
};

assert.equal((await GET(request(), context)).status, 401);
assert.equal((await GET(request("user"), context)).status, 403);
if (mode === "details") {
  assert.equal(
    (await GET(request("admin"), { params: Promise.resolve({ id: "bad-id" }) }))
      .status,
    400,
  );
}

// Stub only the database boundary; use Mongoose's real populate implementation.
Object.defineProperty(mongoose.connection, "readyState", { value: 1 });
let referencesExist = true;
let orderExists = true;
User.find = () => ({
  select() { return this; },
  exec: async () => referencesExist
    ? [User.hydrate({ _id: userId, name: "Test buyer", phone: "0000000000" })]
    : [],
});
Course.find = () => ({
  select() { return this; },
  exec: async () => referencesExist
    ? [Course.hydrate({ _id: courseId, title: "Test course", slug: "test-course" })]
    : [],
});
const query = (single) => {
  const populates = [];
  const execute = async () => {
    if (single && !orderExists) return null;
    const sample = {
      _id: orderId,
      user: userId,
      items: [{ course: courseId, price: 100 }],
      totalPrice: 100,
      status: "paid",
    };
    return Order.populate(single ? sample : [sample], populates);
  };
  return {
    populate(options) {
      assert.equal(options.model, options.path === "user" ? User : Course);
      populates.push(options);
      return this;
    },
    sort() { return this; },
    skip() { return this; },
    limit() { return this; },
    lean: execute,
    then(resolve, reject) { return execute().then(resolve, reject); },
  };
};
Order.find = () => query(false);
Order.findById = () => query(true);
Order.countDocuments = async () => 1;

const response = await GET(request("admin"), context);
assert.equal(response.status, 200);
const data = await response.json();
const order = mode === "list" ? data.orders[0] : data.order;
assert.equal(order.user.name, "Test buyer");
assert.equal(order.items[0].course.title, "Test course");
if (mode === "list") assert.equal(data.total, 1);

referencesExist = false;
const missingResponse = await GET(request("admin"), context);
assert.equal(missingResponse.status, 200);
const missingData = await missingResponse.json();
const missingOrder = mode === "list" ? missingData.orders[0] : missingData.order;
assert.equal(missingOrder.user, null);
assert.equal(missingOrder.items[0].course, null);
if (mode === "details") {
  orderExists = false;
  assert.equal((await GET(request("admin"), context)).status, 404);
}
console.log(`PASS ${mode}: cold model registration, population, missing references and access control`);
