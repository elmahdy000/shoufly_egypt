import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
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
       await prisma.notification.create({
         data: {
           userId: 1, // System Admin ID
           type: 'NEW_REQUEST', // Reuse generic type or add specific one
           title: 'طلب انضمام مورد جديد',
           message: `المورد ${user.fullName} سجل في المنصة وينتظر التفعيل.`,
         }
       });
    }

    return NextResponse.json(user, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
