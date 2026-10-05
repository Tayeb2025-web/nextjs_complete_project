import connectMongo from "@/configs/connectDB";
import User from "@/models/User";
import { isAdmin } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await connectMongo();

    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 },
      );
    }

    const {name , phone , role} = await req.json();

    //validation

    const user = await User.findById(id);
    if(!user) {
        return NextResponse.json(
            {success: false , message: 'user not found'},
            {status: 404}
        )
    }

    if(name !== undefined) user.name = name.trim() || '';
    if(phone !== undefined) user.phone = phone.trim() || '';
    if(role !== undefined) user.role = role

    await user.save();

    const updatedUser = await User.findById(id).select('name role email phone')
    return NextResponse.json({
        success: true , 
        message: 'user updated successfully',
        user: updatedUser
    })
  } catch (error) {
    console.log(error.message);
    
    return NextResponse.json(
        {success: false , message: "server error"} ,
        {status: 500}
    )
  }
}

//api/admin/users/[id]