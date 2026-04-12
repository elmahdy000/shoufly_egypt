import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bidId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const { bidId } = await params;
    const { status } = await req.json(); // e.g. VENDOR_PREPARING, READY_FOR_PICKUP

    const bid = await prisma.bid.findFirst({
      where: { id: parseInt(bidId), vendorId: user.id },
      include: { request: true }
    });

    if (!bid) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // 🛡️ Logic Check: Only active (accepted) bids can be updated
    if (bid.status !== 'ACCEPTED_BY_CLIENT') {
      return NextResponse.json({ error: 'هذا العرض لم يتم قبوله بعد من العميل' }, { status: 400 });
    }

    // Check last status to avoid duplicates
    const lastTracking = await prisma.deliveryTracking.findFirst({
        where: { requestId: bid.requestId },
        orderBy: { createdAt: 'desc' }
    });

    if (lastTracking?.status === status) {
        return NextResponse.json({ error: 'الطلب بالفعل في هذه الحالة' }, { status: 400 });
    }

    // Update Request Progress
    await prisma.deliveryTracking.create({
      data: {
        requestId: bid.requestId,
        status: status as any,
        note: `المورد حدّث الحالة إلى: ${status === 'VENDOR_PREPARING' ? 'جاري التحضير' : 'جاهز للاستلام'}`
      }
    });

    return NextResponse.json({ 
        success: true, 
        message: 'تم تحديث حالة الطلب بنجاح',
        newStatus: status
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
