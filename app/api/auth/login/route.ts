import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/validations/auth";
import { createSessionToken } from "@/lib/session";
import { checkRateLimit, getClientIP } from "@/lib/utils/rate-limiter";
import { createErrorResponse, logError } from "@/lib/utils/error-handler";
import { generateCsrfToken } from "@/lib/utils/csrf";

// Rate limit: 5 login attempts per minute per IP
const LOGIN_RATE_LIMIT = 5;
const LOGIN_WINDOW_MS = 60000; // 1 minute

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP(req.headers);
    const rateLimitKey = `login:${clientIP}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, LOGIN_RATE_LIMIT, LOGIN_WINDOW_MS);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetTime),
          }
        },
      );
    }

    const body = await req.json();
    const data = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      const isProvider = user.role === 'VENDOR' || user.role === 'DELIVERY';
      const errorMsg = isProvider 
        ? "حسابك قيد المراجعة حالياً من قبل الإدارة. سيتم تفعيلك فور التأكد من بياناتك." 
        : "هذا الحساب معطل حالياً. يرجى التواصل مع الدعم الفني.";
        
      return NextResponse.json(
        { error: errorMsg },
        { status: 403 },
      );
    }

    const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("SESSION_SECRET or JWT_SECRET environment variable is required");
    }
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
    const token = await createSessionToken(
      { userId: user.id, role: user.role, exp },
      secret,
    );

    const res = NextResponse.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });

    const maxAge = 60 * 60 * 24 * 7;

    // Cookie settings for iframe compatibility (v0 preview, Replit, etc.)
    // Use SameSite=None; Secure; Partitioned for cross-site iframe support
    // This works for normal browsing AND iframe contexts
    const sessionCookie = [
      `session_token=${token}`,
      `Max-Age=${maxAge}`,
      `Path=/`,
      `HttpOnly`,
      `Secure`,
      `SameSite=None`,
      `Partitioned`,
    ].join("; ");

    const csrfToken = generateCsrfToken();
    const csrfCookie = [
      `csrf_token=${csrfToken}`,
      `Max-Age=${60 * 60 * 24}`,
      `Path=/`,
      `Secure`,
      `SameSite=None`,
      `Partitioned`,
    ].join("; ");

    // Append both cookies - using append to support multiple Set-Cookie headers
    res.headers.append("Set-Cookie", sessionCookie);
    res.headers.append("Set-Cookie", csrfCookie);

    return res;
  } catch (e: unknown) {
    logError('LOGIN', e);
    const { response, status } = createErrorResponse(e, 400);
    return NextResponse.json(response, { status });
  }
}
