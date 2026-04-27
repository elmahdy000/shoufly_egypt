import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { Notify } from '../notifications/hub';

export async function acceptOffer(bidId: number, clientId: number) {
  logger.info('offer.accept.started', { bidId, clientId });
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { request: true },
  });

  if (!bid) {
    throw new Error('عرض السعر ده مش موجود.');
  }

  if (bid.status !== 'SELECTED') {
    throw new Error('مينفعش تقبل العرض ده دلوقتي.');
  }

  if (bid.request.status !== 'OFFERS_FORWARDED') {
    throw new Error('الطلب لسه مخلصش مرحلة استقبال العروض.');
  }

  if (bid.request.clientId !== clientId) {
    throw new Error('معلش، صاحب الطلب بس هو اللي يقدر يقبل العروض.');
  }

  // NEW: Prevent double selection
  if (bid.request.selectedBidId) {
    throw new Error('إنت وافقت على عرض للطلب ده قبل كده خلاص.');
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.bid.update({
      where: { id: bidId },
      data: { status: 'ACCEPTED_BY_CLIENT' },
      include: {
        vendor: { select: { id: true, fullName: true } },
        request: { select: { id: true, title: true } },
      },
    });

    await tx.request.update({
      where: { id: bid.requestId },
      data: {
        selectedBidId: bid.id,
        status: 'OFFERS_FORWARDED',
      },
    });

    // ⛔ NEW: Reject all other competing bids for this request
    await tx.bid.updateMany({
      where: {
        requestId: bid.requestId,
        id: { not: bidId },
        status: { in: ['PENDING', 'SELECTED'] },
      },
      data: { status: 'REJECTED' },
    });

    await Notify.send({
      userId: bid.vendorId,
      type: 'BID_ACCEPTED',
      title: 'تم قبول عرضك! 🎉',
      message: `تهانينا، تم قبول عرض السعر الخاص بك للطلب رقم #${bid.requestId} من قبل العميل. يمكنك الآن انتظار تأكيد الدفع.`,
      requestId: bid.requestId,
    }, tx);

    logger.info('notification.created', {
      event: 'offer.accepted',
      requestId: bid.requestId,
      userId: bid.vendorId,
      role: 'VENDOR',
    });

    return updated;
  });

  logger.info('offer.accept.completed', {
    bidId: result.id,
    requestId: result.requestId,
    clientId,
    status: result.status,
  });

  return result;
}
