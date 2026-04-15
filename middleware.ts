import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { handleCorsPreflight, verifyCorsOrigin, addCorsHeaders } from "@/lib/utils/cors";
import { csrfProtection, createCsrfToken } from "@/lib/utils/csrf";

// Paths that skip CSRF protection (auth endpoints)
const CSRF_EXEMPT_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/auth/password-reset",
];

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
  const isApiRoute = pathname.startsWith("/api/");

  // Handle CORS preflight requests
  const corsPreflightResponse = handleCorsPreflight(req);
  if (corsPreflightResponse) {
    return corsPreflightResponse;
  }

  // Verify CORS origin for API routes
  if (isApiRoute) {
    const { allowed } = verifyCorsOrigin(req);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Origin not allowed" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Allow public paths
  if (
    PUBLIC_PATHS.some(
      (p) => pathname === p || pathname.startsWith("/api/auth/"),
    )
  ) {
    const response = NextResponse.next();
    const origin = req.headers.get('origin');
    if (origin) {
      return addCorsHeaders(response, origin);
    }
    return response;
  }

  // Allow static/next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/public") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next();
  }

  // Skip CSRF for webhooks and auth endpoints
  const isWebhook = pathname.includes('/webhook/');
  const isCsrfExempt = CSRF_EXEMPT_PATHS.some(p => pathname.startsWith(p));
  
  // CSRF Protection for state-changing API routes
  if (pathname.startsWith("/api/") && !isWebhook && !isCsrfExempt) {
    const { valid, response: csrfResponse } = csrfProtection(req);
    if (!valid && csrfResponse) {
      return csrfResponse;
    }
  }

  const token = req.cookies.get("session_token")?.value;
  const secret = process.env.SESSION_SECRET;

  if (!token || !secret) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = await verifySessionToken(token, secret);
  if (!payload) {
    if (isApiRoute) {
      const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      res.cookies.set("session_token", "", { maxAge: 0 });
      return res;
    }
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set("session_token", "", { maxAge: 0 });
    return res;
  }

  // 🚀 PERFORMANCE: Check user status via Redis cache (60s TTL) instead of hitting DB every request.
  // Cache key: user_status:{userId} → "active" | "blocked"
  // Cache is invalidated immediately when user is blocked via moderation API.
  try {
    let userStatus: string | null = null;
    const cacheKey = `user_status:${payload.userId}`;

    // Try Redis cache first
    try {
      const { getRedisClient } = await import("@/lib/redis");
      const redis = getRedisClient();
      userStatus = await redis.get(cacheKey);
    } catch {
      // Redis unavailable — fall through to DB
    }

    if (!userStatus) {
      // Cache miss: hit DB and cache the result
      const { prisma } = await import("@/lib/prisma");
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { isBlocked: true, isActive: true },
      });

      if (!user || user.isBlocked || !user.isActive) {
        const res = isApiRoute
          ? NextResponse.json({ error: "Account disabled" }, { status: 403 })
          : NextResponse.redirect(new URL("/login?error=account_disabled", req.url));
        res.cookies.set("session_token", "", { maxAge: 0 });
        return res;
      }

      // Cache the "active" status for 60 seconds
      try {
        const { getRedisClient } = await import("@/lib/redis");
        const redis = getRedisClient();
        await redis.set(cacheKey, "active", "EX", 60);
      } catch {
        // Non-critical: proceed without caching
      }
    } else if (userStatus === "blocked") {
      // Cached blocked status — deny immediately, no DB needed
      const res = isApiRoute
        ? NextResponse.json({ error: "Account disabled" }, { status: 403 })
        : NextResponse.redirect(new URL("/login?error=account_disabled", req.url));
      res.cookies.set("session_token", "", { maxAge: 0 });
      return res;
    }
    // userStatus === "active" → proceed without any DB call 🎉
  } catch (error) {
    console.error("[MIDDLEWARE] Status check failed:", error);
    // Fail-safe: allow through if both Redis and DB are down
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

  let response = NextResponse.next();
  
  // Add CORS headers to API responses
  if (pathname.startsWith("/api/")) {
    const origin = req.headers.get('origin');
    if (origin) {
      response = addCorsHeaders(response, origin);
    }
  }
  
  // Ensure CSRF token exists for all authenticated requests
  // This is needed so client-side API calls can include the token
  const hasCsrfCookie = req.cookies.get('csrf_token')?.value;
  if (!hasCsrfCookie) {
    createCsrfToken(response);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|public).*)"],
};
