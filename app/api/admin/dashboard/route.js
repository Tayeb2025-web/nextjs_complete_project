import connectMongo from "@/configs/connectDB";
import Order from "@/models/Order";
import User from "@/models/User";
import Course from "@/models/Course";
import Comment from "@/models/Comment";
import { isAdmin } from "@/utils/auth";
import { NextResponse } from "next/server";

const totals = () => ({
  $group: {
    _id: null,
    total: { $sum: "$totalPrice" },
    count: { $sum: 1 },
  },
});

export async function GET(req) {
  try {
    const auth = isAdmin(req);
    if (!auth.isAdmin) return auth;

    await connectMongo();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const thisMonthStart = new Date(todayStart);
    thisMonthStart.setDate(1);

    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const days = Array.from({ length: 7 }, (_, index) => {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - (6 - index));
      return start;
    });

    const rangeStart = new Date(
      Math.min(lastMonthStart.getTime(), days[0].getTime())
    );

    const [
      totalUsers,
      totalCourses,
      totalOrders,
      totalComments,
      salesResult,
      unansweredResult,
      recentComments,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments({}),
      Course.countDocuments({}),
      Order.countDocuments({}),
      Comment.countDocuments({}),

      // تمام آمار فروش در یک درخواست
      Order.aggregate([
        {
          $match: {
            status: "paid",
            paidAt: { $gte: rangeStart, $lt: tomorrowStart },
          },
        },
        {
          $facet: {
            today: [
              { $match: { paidAt: { $gte: todayStart } } },
              totals(),
            ],
            thisMonth: [
              { $match: { paidAt: { $gte: thisMonthStart } } },
              totals(),
            ],
            lastMonth: [
              {
                $match: {
                  paidAt: {
                    $gte: lastMonthStart,
                    $lt: thisMonthStart,
                  },
                },
              },
              totals(),
            ],
            last7Days: [
              { $match: { paidAt: { $gte: days[0] } } },
              {
                $bucket: {
                  groupBy: "$paidAt",
                  boundaries: [...days, tomorrowStart],
                  output: {
                    total: { $sum: "$totalPrice" },
                    count: { $sum: 1 },
                  },
                },
              },
            ],
          },
        },
      ]),

      // شمارش نظرات بدون پاسخ، داخل دیتابیس
      Comment.aggregate([
        { $match: { parentComment: null } },
        {
          $lookup: {
            from: Comment.collection.name,
            let: { commentId: "$_id" },
            pipeline: [
              {
                $match: {
                  isAdminReply: true,
                  $expr: {
                    $eq: ["$parentComment", "$$commentId"],
                  },
                },
              },
              { $limit: 1 },
              { $project: { _id: 1 } },
            ],
            as: "adminReplies",
          },
        },
        {
          $match: {
            "adminReplies.0": { $exists: false },
          },
        },
        { $count: "count" },
      ]),

      Comment.find({ parentComment: null })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .populate("course", "title slug")
        .lean(),

      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .lean(),
    ]);

    const sales = salesResult[0] || {};

    const dailySales = new Map(
      (sales.last7Days || []).map((day) => [
        new Date(day._id).getTime(),
        day,
      ])
    );

    return NextResponse.json(
      {
        success: true,
        adminId: String(auth.adminId),
        stats: {
          totalUsers,
          totalCourses,
          totalOrders,
          totalComments,
          unansweredComments: unansweredResult[0]?.count || 0,
          todaySales: sales.today?.[0]?.total || 0,
          todayOrdersCount: sales.today?.[0]?.count || 0,
          thisMonthSales: sales.thisMonth?.[0]?.total || 0,
          thisMonthOrdersCount: sales.thisMonth?.[0]?.count || 0,
          lastMonthSales: sales.lastMonth?.[0]?.total || 0,
          lastMonthOrdersCount: sales.lastMonth?.[0]?.count || 0,
        },
        charts: {
          last7Days: days.map((start) => {
            const day = dailySales.get(start.getTime());

            return {
              date: start.toLocaleDateString("fa-IR", {
                month: "short",
                day: "numeric",
              }),
              sales: day?.total || 0,
              orders: day?.count || 0,
            };
          }),
        },
        recentComments,
        recentOrders,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}