import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const tokenSchema = z.object({
  token: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const body = await req.json();
    const { token } = tokenSchema.parse(body);

    await prisma.user.update({
      where: { id: user.id },
      data: { fcmToken: token },
    });

    return NextResponse.json({ success: true, message: 'Device token updated' });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update token' },
      { status: 400 }
    );
  }
}
