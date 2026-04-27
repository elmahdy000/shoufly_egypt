import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validations/auth";
import { checkRateLimit, getClientIP } from "@/lib/utils/rate-limiter";
import { createErrorResponse, logError } from "@/lib/utils/error-handler";
import { createSessionToken } from "@/lib/session";

// Rate limit: 3 registration attempts per hour per IP
const REGISTER_RATE_LIMIT = 3;
const REGISTER_WINDOW_MS = 3600000; // 1 hour

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP(req.headers);
    const rateLimitKey = `register:${clientIP}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, REGISTER_RATE_LIMIT, REGISTER_WINDOW_MS);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
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
    const data = RegisterSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(data.password, 10);
    
    // SECURITY: Prevent ADMIN registration via public API
    // Only CLIENT, VENDOR, and DELIVERY roles can register through public endpoint
    // ADMIN accounts must be created manually or through a secure admin-only endpoint
    const allowedRoles = ['CLIENT', 'VENDOR', 'DELIVERY'];
    if (!allowedRoles.includes(data.role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 },
      );
    }
    
    const isProvider = data.role === 'VENDOR' || data.role === 'DELIVERY';

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashed,
        phone: data.phone ?? null,
        role: data.role,
        governorateId: data.governorateId ?? null,
        cityId: data.cityId ?? null,
        isActive: !isProvider, // Clients are active immediately, providers need approval
      },
      select: { id: true, fullName: true, email: true, role: true, isActive: true },
    });

    if (isProvider) {
       // Notify admin about new provider waiting for approval
       // Find first admin user dynamically
       const admin = await prisma.user.findFirst({
         where: { role: 'ADMIN' },
         orderBy: { id: 'asc' },
         select: { id: true }
       });
       
       if (admin) {
         await prisma.notification.create({
           data: {
             userId: admin.id,
             type: 'WITHDRAWAL_REQUESTED', // Using this since NotificationType does not have a VENDOR_ONBOARD type
             title: 'طلب انضمام مورد جديد',
             message: `المورد ${user.fullName} سجل في المنصة وينتظر التفعيل.`,
           }
         });
       }
    }

    if (!user.isActive) {
      return NextResponse.json(user, { status: 201 });
    }

    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      return NextResponse.json(user, { status: 201 });
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const token = await createSessionToken(
      { userId: user.id, role: user.role, exp },
      secret,
    );

    return NextResponse.json({ ...user, token }, { status: 201 });
  } catch (e: unknown) {
    logError('REGISTER', e);
    const { response, status } = createErrorResponse(e, 400);
    return NextResponse.json(response, { status });
  }
}
