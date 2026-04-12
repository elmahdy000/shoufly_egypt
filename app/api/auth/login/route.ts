import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/validations/auth";
import { createSessionToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
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

    const secret = process.env.SESSION_SECRET!;
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

    res.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
