import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'

export const isAdmin = (req) => {

    const accessToken = req.cookies.get("accessToken")?.value;
    
        if (!accessToken) {
          return NextResponse.json(
            { success: false, message: "please login first" },
            { status: 401 },
          );
        }
    
        let payload;
        try {
          payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
          if(payload.role !='admin') {
            return NextResponse.json(
                {success: false , message: 'this route is only for admin'} ,
                {status: 403}
            )
          }
          return {isAdmin: true , adminId: payload.userId}
        } catch (error) {
          return NextResponse.json(
            { success: false, message: "invalid or expired token" },
            { status: 401 },
          );
        }
}

export function getCurrentUser(req) {
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "please login" },
      { status: 401 },
    );
  }

  let payload;
  try {
    payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    return { success : true , userId: payload.userId };
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "invalid or expired token" },
      { status: 401 },
    );
  }
}