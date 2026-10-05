import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
export const runtime = "nodejs";

export async function middleware(req, res) {
  const accessToken = req.cookies.get("accessToken")?.value;

  const pathname = await req.nextUrl.pathname;

  if (pathname == "/auth") {
    if (accessToken) {
      try {
        const payload = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET,
        );
        const redirectTo =
          payload.role == "user" ? "/profile" : "/admin/dashboard";
        return NextResponse.redirect(new URL(redirectTo, req.url));
      } catch (error) {
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  if (!accessToken) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  try {
    const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (pathname == "/admin/dashboard" && payload.role == "user") {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
    if (pathname == "/profile" && payload.role == "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/auth"],
};
