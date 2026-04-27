import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

const ALLOWED_VENDOR_STATUSES = ['VENDOR_PREPARING', 'READY_FOR_PICKUP'] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bidId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const { bidId } = await params;
    const { status } = await req.json();

    if (!ALLOWED_VENDOR_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'حالة الطلب غير صحيحة' },
        { status: 400 },
      );
    }

    const bid = await prisma.bid.findFirst({
      where: { id: parseInt(bidId), vendorId: user.id },
      include: { request: true },
    });

    if (!bid) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    if (bid.status !== 'ACCEPTED_BY_CLIENT') {
      return NextResponse.json(
        { error: 'هذا العرض لم يتم قبوله بعد من العميل' },
        { status: 400 },
      );
    }

    const lastTracking = await prisma.deliveryTracking.findFirst({
      where: { requestId: bid.requestId },
      orderBy: { createdAt: 'desc' },
    });

    if (lastTracking?.status === status) {
      return NextResponse.json({
        success: true,
        message: 'الطلب بالفعل في هذه الحالة',
        newStatus: status,
        unchanged: true,
      });
    }

    await prisma.deliveryTracking.create({
      data: {
        requestId: bid.requestId,
        status,
        note: `المورد حدّث الحالة إلى: ${
          status === 'VENDOR_PREPARING' ? 'جاري التحضير' : 'جاهز للاستلام'
        }`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      newStatus: status,
    });
  } catch (error: unknown) {
    logError('VENDOR_BID_STATUS_PATCH', error);
    const { response, status } = createErrorResponse(error, 500);
    return NextResponse.json(response, { status });
  }
}
