import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentUser(req.headers);
    requireUser(admin);
    requireRole(admin, 'ADMIN');

    const pendingKyc = await prisma.user.findMany({
      where: { verificationStatus: 'PENDING' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        idCardFrontUrl: true,
        idCardBackUrl: true,
        kycSubmissionDate: true,
      },
      orderBy: { kycSubmissionDate: 'asc' }
    });

    return NextResponse.json(pendingKyc);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
