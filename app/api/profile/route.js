import connectMongo from "@/configs/connectDB";
import User from "@/models/User";
import Order from "@/models/Order";
import Course from "@/models/Course";
import Comment from "@/models/Comment";
import { getCurrentUser } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongo();

    const auth = getCurrentUser(req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(auth.userId)
      .select("name email phone role createdAt purchasedCourses")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // تعداد دوره‌های خریداری شده
    const purchasedCount = user.purchasedCourses?.length || 0;

    // سفارشات کاربر
    const orders = await Order.find({ user: auth.userId })
      .populate("items.course", "title slug thumbnail")
      .sort({ createdAt: -1 })
      .lean();

    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.status === "paid");
    const totalSpent = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    // کامنت‌های کاربر
    const totalComments = await Comment.countDocuments({ user: auth.userId });

    // آخرین سفارشات
    const recentOrders = orders.slice(0, 5);

    return NextResponse.json(
      {
        success: true,
        user,
        stats: {
          purchasedCount,
          totalOrders,
          totalSpent,
          totalComments,
        },
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

// ویرایش اطلاعات کاربر
export async function PATCH(req) {
  try {
    await connectMongo();

    const auth = getCurrentUser(req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, phone } = await req.json();

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    const updatedUser = await User.findById(auth.userId)
      .select("name email phone role createdAt purchasedCourses")
      .lean();

    return NextResponse.json({
      success: true,
      message: "اطلاعات با موفقیت بروزرسانی شد",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
