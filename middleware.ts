import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateCsrfToken, createCsrfToken } from "./lib/utils/csrf";

/**
 * Optimized Middleware for Security & Performance
 */

// Regex for common static file extensions
const STATIC_FILES_REGEX = /\.(jpg|jpeg|png|gif|webp|svg|css|js|ico|json|pdf|woff2?|map)$/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, internal Next.js routes, and auth/webhook exclusions
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/payments/webhook") || // External provider callback
    pathname.startsWith("/static") ||
    STATIC_FILES_REGEX.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. CSRF Protection for state-changing methods
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    try {
        const isValid = validateCsrfToken(request);
        if (!isValid) {
          return new NextResponse(
            JSON.stringify({ error: "Invalid or missing CSRF token" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
    } catch (e) {
        return new NextResponse(
            JSON.stringify({ error: "CSRF Validation failed" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
    }
  }

  // 3. Proactive CSRF Provisioning
  let response = NextResponse.next();
  if (request.method === "GET") {
    const hasCsrf = request.cookies.has("csrf_token");
    if (!hasCsrf) {
        createCsrfToken(response);
    }
  }

  // 4. Admin Route Protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("session_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
