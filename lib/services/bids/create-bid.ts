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
      throw new Error('عذراً، فقط حسابات الموردين النشطة يمكنها تقديم عروض أسعار.');
    }

    const request = await tx.request.findUnique({
      where: { id: data.requestId },
    });

    if (!request) throw new Error('الطلب الذي تحاول تقديم عرض عليه غير موجود.');

    const settings = await tx.platformSetting.findFirst({ orderBy: { id: 'desc' } });
    const commission = settings ? Number(settings.commissionPercent) / 100 : 0.15;
    const clientPrice = Number(data.netPrice) * (1 + commission);

    const bid = await tx.bid.upsert({
      where: { requestId_vendorId: { requestId: data.requestId, vendorId } },
      create: {
        requestId: data.requestId,
        vendorId,
        description: data.description,
        netPrice: data.netPrice,
        clientPrice: clientPrice,
        status: 'PENDING',
      },
      update: {
        description: data.description,
        netPrice: data.netPrice,
        clientPrice: clientPrice,
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

