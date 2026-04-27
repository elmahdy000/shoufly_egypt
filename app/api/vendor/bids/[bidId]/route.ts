import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

const UpdateBidSchema = z.object({
  netPrice: z.coerce.number().positive().optional(),
  duration: z.string().max(100).nullable().optional(),
  description: z.string().min(3).max(500).optional(),
});

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

    if (!bid) return NextResponse.json({ error: 'العرض غير موجود' }, { status: 404 });

    return NextResponse.json(bid);
  } catch (error: unknown) {
    logError('VENDOR_BID_GET', error);
    const { response, status } = createErrorResponse(error, 500);
    return NextResponse.json(response, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bidId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const { bidId } = await params;
    const data = UpdateBidSchema.parse(await req.json());

    const bid = await prisma.bid.findFirst({
      where: { id: parseInt(bidId), vendorId: user.id },
    });

    if (!bid) {
      return NextResponse.json({ error: 'العرض غير موجود' }, { status: 404 });
    }

    if (bid.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'لا يمكن تعديل العرض بعد مراجعته أو إرساله للعميل' },
        { status: 400 },
      );
    }

    let clientPrice = bid.clientPrice;
    if (data.netPrice !== undefined) {
      const settings = await prisma.platformSetting.findFirst({ orderBy: { id: 'desc' } });
      const commissionPercent = Number(settings?.commissionPercent ?? 15);
      const { d, mul, div, add, toTwo } = await import('@/lib/utils/decimal');
      clientPrice = toTwo(mul(d(data.netPrice), add(1, div(commissionPercent, 100))));
    }

    const updated = await prisma.bid.update({
      where: { id: bid.id },
      data: {
        ...(data.netPrice !== undefined ? { netPrice: data.netPrice, clientPrice } : {}),
        ...(data.duration !== undefined ? { duration: data.duration } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            categoryId: true,
            status: true,
            deliveryTracking: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { status: true, createdAt: true },
            },
          },
        },
        vendor: { select: { id: true, fullName: true } },
        images: { select: { id: true, filePath: true, fileName: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    logError('VENDOR_BID_PATCH', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}
