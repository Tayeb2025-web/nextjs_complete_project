import connectMongo from "@/configs/connectDB";
import Order from "@/models/Order";
import User from "@/models/User";
import Course from "@/models/Course";
import Comment from "@/models/Comment";
import { isAdmin } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongo();

    // admin check
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    // ========== تعداد کل‌ها ==========
    const totalUsers = await User.countDocuments({});
    const totalCourses = await Course.countDocuments({});
    const totalOrders = await Order.countDocuments({});
    const totalComments = await Comment.countDocuments({});

    // ========== کامنت‌های بدون پاسخ ==========
    // کامنت‌هایی که پاسخ ادمین ندارن (parentComment ندارن و reply هم ندارن)
    const allMainComments = await Comment.find({ parentComment: null }).lean();
    const allReplies = await Comment.find({
      parentComment: { $ne: null },
      isAdminReply: true,
    }).lean();

    const repliedParentIds = allReplies.map((r) =>
      r.parentComment.toString()
    );
    const unansweredComments = allMainComments.filter(
      (c) => !repliedParentIds.includes(c._id.toString())
    ).length;

    // ========== فروش امروز ==========
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaySalesResult = await Order.aggregate([
      {
        $match: {
          status: "paid",
          paidAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
    ]);

    const todaySales = todaySalesResult[0]?.total || 0;
    const todayOrdersCount = todaySalesResult[0]?.count || 0;

    // ========== فروش این ماه ==========
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const thisMonthSalesResult = await Order.aggregate([
      {
        $match: {
          status: "paid",
          paidAt: { $gte: thisMonthStart, $lte: todayEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
    ]);

    const thisMonthSales = thisMonthSalesResult[0]?.total || 0;
    const thisMonthOrdersCount = thisMonthSalesResult[0]?.count || 0;

    // ========== فروش ماه قبل ==========
    const lastMonthEnd = new Date(thisMonthStart);
    lastMonthEnd.setMilliseconds(-1);

    const lastMonthStart = new Date(lastMonthEnd);
    lastMonthStart.setDate(1);
    lastMonthStart.setHours(0, 0, 0, 0);

    const lastMonthSalesResult = await Order.aggregate([
      {
        $match: {
          status: "paid",
          paidAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
    ]);

    const lastMonthSales = lastMonthSalesResult[0]?.total || 0;
    const lastMonthOrdersCount = lastMonthSalesResult[0]?.count || 0;

    // ========== فروش 7 روز اخیر (برای نمودار) ==========
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayResult = await Order.aggregate([
        {
          $match: {
            status: "paid",
            paidAt: { $gte: dayStart, $lte: dayEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
      ]);

      last7Days.push({
        date: dayStart.toLocaleDateString("fa-IR", {
          month: "short",
          day: "numeric",
        }),
        sales: dayResult[0]?.total || 0,
        orders: dayResult[0]?.count || 0,
      });
    }

    // ========== آخرین کامنت‌ها ==========
    const recentComments = await Comment.find({ parentComment: null })
      .populate("user", "name email")
      .populate("course", "title slug")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ========== آخرین سفارشات ==========
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalUsers,
          totalCourses,
          totalOrders,
          totalComments,
          unansweredComments,
          todaySales,
          todayOrdersCount,
          thisMonthSales,
          thisMonthOrdersCount,
          lastMonthSales,
          lastMonthOrdersCount,
        },
        charts: {
          last7Days,
        },
        recentComments,
        recentOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
