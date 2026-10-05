import connectMongo from "@/configs/connectDB";
import User from "@/models/User";
import { isAdmin } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongo();

    const auth = isAdmin(req)

    if(!auth.isAdmin) {
       return auth
    }

    const {searchParams} = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || 1;
    const limit = 5;

    const query = search ? {
      $or : [
        {name: {$regex:search}},
        {phone: {$regex:search}},
        {email: {$regex:search}},
      ]
    } : {} ;


    const users = await User.find(query)
      .select("_id name email phone role isVerified createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

      const total = await User.countDocuments(query);

    return NextResponse.json({ success: true, users , total }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "server error" }, { status: 500 });
  }
}