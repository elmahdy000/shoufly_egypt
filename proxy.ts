import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateCsrfToken, createCsrfToken } from "./lib/utils/csrf";

const STATIC_FILES_REGEX = /\.(jpg|jpeg|png|gif|webp|svg|css|js|ico|json|pdf|woff2?|map)$/i;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (process.env.NODE_ENV === "development") {
    const origin = request.headers.get("origin");
    if (origin && (origin.includes("localhost") || origin.includes("127.0.0.1"))) {
      if (request.method === "OPTIONS") {
        return new NextResponse(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      const response = NextResponse.next();
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      return response;
    }
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/payments/webhook") ||
    pathname.startsWith("/api/payments/paymob/webhook") ||
    pathname.startsWith("/api/payments/fawry/webhook") ||
    pathname.startsWith("/static") ||
    STATIC_FILES_REGEX.test(pathname)
  ) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && !authHeader) {
    try {
      const isValid = validateCsrfToken(request);
      if (!isValid) {
        return new NextResponse(
          JSON.stringify({ error: "Invalid or missing CSRF token" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch {
      return new NextResponse(
        JSON.stringify({ error: "CSRF Validation failed" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  const response = NextResponse.next();
  if (request.method === "GET") {
    const hasCsrf = request.cookies.has("csrf_token");
    if (!hasCsrf) {
      createCsrfToken(response);
    }
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("session_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
