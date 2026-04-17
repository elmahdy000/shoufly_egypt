import { prisma } from '../../prisma';
import { logger } from '../../utils/logger';
import { Notify } from '../notifications/hub';
// ... rest of imports ...

export async function createBid(vendorId: number, data: any) {
  logger.info('bid.submitted.started', { vendorId, requestId: data.requestId });

  return prisma.$transaction(async (tx) => {
    // ... validation logic ...
    const vendor = await tx.user.findUnique({
      where: { id: vendorId },
      select: { id: true, role: true, isActive: true },
    });

    if (!vendor || vendor.role !== 'VENDOR' || !vendor.isActive) {
      throw new Error('Only active vendor users can submit bids');
    }

    const request = await tx.request.findUnique({
      where: { id: data.requestId },
    });

    if (!request) throw new Error('Request not found');

    const bid = await tx.bid.upsert({
      where: { requestId_vendorId: { requestId: data.requestId, vendorId } },
      create: {
        requestId: data.requestId,
        vendorId,
        description: data.description,
        netPrice: data.netPrice,
        clientPrice: data.netPrice * 1.15, // Simple approximation for seeds
        status: 'PENDING',
      },
      update: {
        description: data.description,
        netPrice: data.netPrice,
        clientPrice: data.netPrice * 1.15,
        status: 'PENDING',
      },
    });

    if (request.status === 'OPEN_FOR_BIDDING') {
      await tx.request.update({
        where: { id: data.requestId },
        data: { status: 'BIDS_RECEIVED' },
      });
    }

    // REAL-TIME NOTIFICATION
    await Notify.newBid(request.clientId, request.id, Number(bid.clientPrice));

    return bid;
  });
}

