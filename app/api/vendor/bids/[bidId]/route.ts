import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bidId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const { bidId } = await params;
    const bid = await prisma.bid.findFirst({
      where: {
        id: parseInt(bidId),
        vendorId: user.id
      },
      include: {
        request: {
          include: {
            client: {
              select: { fullName: true, phone: true }
            }
          }
        }
      }
    });

    if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });

    return NextResponse.json(bid);
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
