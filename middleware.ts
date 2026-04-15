import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { handleCorsPreflight, verifyCorsOrigin, addCorsHeaders } from "@/lib/utils/cors";
import { csrfProtection, refreshCsrfToken, createCsrfToken } from "@/lib/utils/csrf";

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

  // Handle CORS preflight requests
  const corsPreflightResponse = handleCorsPreflight(req);
  if (corsPreflightResponse) {
    return corsPreflightResponse;
  }

  // Verify CORS origin for API routes
  if (pathname.startsWith("/api/")) {
    const { allowed, origin } = verifyCorsOrigin(req);
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
    pathname.startsWith("/public")
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
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = await verifySessionToken(token, secret);
  if (!payload) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set("session_token", "", { maxAge: 0 });
    return res;
  }

  // 🛡️ SECURITY SHIELD: Check DB for real-time status (Blocked/Active)
  // This prevents blocked users with valid tokens from accessing the system.
  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isBlocked: true, isActive: true }
    });

    if (!user || user.isBlocked || !user.isActive) {
      const res = NextResponse.redirect(new URL("/login?error=account_disabled", req.url));
      res.cookies.set("session_token", "", { maxAge: 0 });
      return res;
    }
  } catch (error) {
    // If DB check fails, we allow next (fail-safe) or block (strict)? 
    // Usually fail-safe for UI, but here we proceed as payload was valid.
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
  
  // Refresh CSRF token for API routes (not webhooks or auth endpoints)
  if (pathname.startsWith("/api/") && !isWebhook && !isCsrfExempt) {
    const csrfToken = req.cookies.get('csrf_token')?.value;
    if (!csrfToken) {
      createCsrfToken(response);
    }
  }
  
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|public).*)"],
};
