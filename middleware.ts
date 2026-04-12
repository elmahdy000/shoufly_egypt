import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];

const ROLE_PREFIXES: Record<string, string> = {
  "/client": "CLIENT",
  "/vendor": "VENDOR",
  "/admin": "ADMIN",
  "/delivery": "DELIVERY",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (
    PUBLIC_PATHS.some(
      (p) => pathname === p || pathname.startsWith("/api/auth/"),
    )
  ) {
    return NextResponse.next();
  }

  // Allow static/next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session_token")?.value;
  const secret = process.env.SESSION_SECRET;

  if (!token || !secret) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = await verifySessionToken(token, secret);
  if (!payload) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set("session_token", "", { maxAge: 0 });
    return res;
  }

  // Role-based routing guard
  for (const [prefix, role] of Object.entries(ROLE_PREFIXES)) {
    if (pathname.startsWith(prefix)) {
      if (payload.role !== role) {
        // Redirect to their correct portal
        const redirectPath =
          payload.role === "CLIENT"
            ? "/client"
            : payload.role === "VENDOR"
              ? "/vendor"
              : payload.role === "DELIVERY"
                ? "/delivery"
                : "/admin";
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|public).*)"],
};
