import { prisma } from '@/lib/prisma';
import { CreateBidInput } from '@/lib/validations/bid';
import { logger } from '@/lib/utils/logger';

const COMMISSION_PERCENTAGE = 15; // From platform settings

export async function createBid(vendorId: number, data: CreateBidInput) {
  logger.info('bid.submitted.started', { vendorId, requestId: data.requestId });

  return prisma.$transaction(async (tx) => {
    const vendor = await tx.user.findUnique({
      where: { id: vendorId },
      select: { id: true, role: true, isActive: true },
    });

    if (!vendor || vendor.role !== 'VENDOR' || !vendor.isActive) {
      throw new Error('Only active vendor users can submit bids');
    }

    // Verify request exists and is open for bidding
    const request = await tx.request.findUnique({
      where: { id: data.requestId },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (
      request.status !== 'OPEN_FOR_BIDDING' &&
      request.status !== 'BIDS_RECEIVED'
    ) {
      throw new Error(
        `Cannot bid on request in status ${request.status}`
      );
    }

    // Fetch commission percentage from settings
    const settings = await tx.platformSetting.findFirst({
      orderBy: { id: 'desc' },
    });
    const commissionPercentage = Number(settings?.commissionPercent || 15);

    // Calculate client price (net price + commission)
    const clientPrice = Math.round(
      data.netPrice * (1 + commissionPercentage / 100) * 100
    ) / 100;

    const bid = await tx.bid.create({
      data: {
        requestId: data.requestId,
        vendorId,
        description: data.description,
        netPrice: data.netPrice,
        clientPrice,
        status: 'PENDING',
      },
      include: {
        vendor: { select: { id: true, fullName: true } },
        request: { select: { id: true, title: true } },
      },
    });

    // Create bid images if provided
    if (data.images && data.images.length > 0) {
      await Promise.all(
        data.images.map((imageUrl) =>
          tx.bidImage.create({
            data: {
              bidId: bid.id,
              filePath: imageUrl,
              fileName: imageUrl.split('/').pop() || 'image',
              mimeType: 'image/jpeg',
              fileSize: 0,
            },
          })
        )
      );
    }

    // Update request status to BIDS_RECEIVED if not already
    if (request.status === 'OPEN_FOR_BIDDING') {
      await tx.request.update({
        where: { id: data.requestId },
        data: { status: 'BIDS_RECEIVED' },
      });
    }

    await tx.notification.create({
      data: {
        userId: request.clientId,
        type: 'NEW_BID',
        title: 'New Bid Received',
        message: `You received a new bid for request #${request.id}.`,
      },
    });

    logger.info('notification.created', {
      event: 'bid.submitted',
      requestId: request.id,
      userId: request.clientId,
      role: 'CLIENT',
    });

    logger.info('bid.submitted.completed', {
      bidId: bid.id,
      vendorId,
      requestId: data.requestId,
      status: bid.status,
    });

    return bid;
  });
}

