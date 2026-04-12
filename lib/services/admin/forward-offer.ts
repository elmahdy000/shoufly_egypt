import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function forwardOffer(bidId: number) {
  logger.info('offer.forward.started', { bidId });
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { request: true },
  });

  if (!bid) {
    throw new Error('Bid not found');
  }

  if (bid.request.status !== 'BIDS_RECEIVED') {
    throw new Error(
      `Cannot forward bid from request in status ${bid.request.status}`
    );
  }

  if (bid.status !== 'PENDING') {
    throw new Error(`Only pending bids can be forwarded. Current status: ${bid.status}`);
  }

  const updatedBid = await prisma.$transaction(async (tx) => {
    const selected = await tx.bid.update({
      where: { id: bidId },
      data: { status: 'SELECTED' },
      include: {
        vendor: { select: { id: true, fullName: true } },
        request: { select: { id: true, title: true } },
      },
    });

    await tx.bid.updateMany({
      where: {
        requestId: bid.requestId,
        id: { not: bidId },
        status: { in: ['PENDING', 'SELECTED'] },
      },
      data: { status: 'REJECTED' },
    });

    await tx.request.update({
      where: { id: bid.requestId },
      data: { status: 'OFFERS_FORWARDED' },
    });

    await tx.notification.create({
      data: {
        userId: bid.request.clientId,
        type: 'OFFER_RECEIVED',
        title: 'Offer Forwarded',
        message: `An offer was forwarded for your request #${bid.requestId}.`,
      },
    });

    logger.info('notification.created', {
      event: 'offer.forwarded',
      requestId: bid.requestId,
      userId: bid.request.clientId,
      role: 'CLIENT',
    });

    return selected;
  });

  logger.info('offer.forward.completed', {
    bidId: updatedBid.id,
    requestId: updatedBid.requestId,
    status: updatedBid.status,
  });

  return updatedBid;
}
