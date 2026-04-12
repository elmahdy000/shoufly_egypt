import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validations/auth";
import { checkRateLimit, getClientIP } from "@/lib/utils/rate-limiter";

// Rate limit: 3 registration attempts per hour per IP
const REGISTER_RATE_LIMIT = 3;
const REGISTER_WINDOW_MS = 3600000; // 1 hour

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP(req.headers);
    const rateLimitKey = `register:${clientIP}`;
    const rateLimitResult = checkRateLimit(rateLimitKey, REGISTER_RATE_LIMIT, REGISTER_WINDOW_MS);
    
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
    const isProvider = data.role === 'VENDOR' || data.role === 'DELIVERY';

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashed,
        phone: data.phone ?? null,
        role: data.role,
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
             type: 'NEW_REQUEST',
             title: 'طلب انضمام مورد جديد',
             message: `المورد ${user.fullName} سجل في المنصة وينتظر التفعيل.`,
           }
         });
       }
    }

    return NextResponse.json(user, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
