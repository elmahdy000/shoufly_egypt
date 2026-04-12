import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function acceptOffer(bidId: number, clientId: number) {
  logger.info('offer.accept.started', { bidId, clientId });
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { request: true },
  });

  if (!bid) {
    throw new Error('Bid not found');
  }

  if (bid.status !== 'SELECTED') {
    throw new Error(`Cannot accept bid in status ${bid.status}`);
  }

  if (bid.request.status !== 'OFFERS_FORWARDED') {
    throw new Error(`Request is in status ${bid.request.status}, cannot accept offer`);
  }

  if (bid.request.clientId !== clientId) {
    throw new Error('Only the client who created the request can accept offers');
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
        status: 'OFFERS_FORWARDED',  // Keep as is - no OFFERS_ACCEPTED in enum
      },
    });

    await tx.notification.create({
      data: {
        userId: bid.vendorId,
        type: 'BID_ACCEPTED',
        title: 'Bid Accepted',
        message: `Your bid for request #${bid.requestId} was accepted by client.`,
      },
    });

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
