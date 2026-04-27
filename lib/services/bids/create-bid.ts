import { prisma } from '../../prisma';
import { logger } from '../../utils/logger';
import { Notify } from '../notifications/hub';
import { CreateBidSchema } from '../../validations/bid';
import { MAX_BID_PRICE, DEFAULT_COMMISSION_PERCENT } from '../../constants/business';

export async function createBid(vendorId: number, data: unknown) {
  // Validate input data using schema
  const validated = CreateBidSchema.parse(data);
  logger.info('bid.submitted.started', { vendorId, requestId: validated.requestId });

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
      where: { id: validated.requestId },
    });

    if (!request) throw new Error('الطلب الذي تحاول تقديم عرض عليه غير موجود.');

    const validStatuses = ['OPEN_FOR_BIDDING', 'BIDS_RECEIVED'];
    if (!validStatuses.includes(request.status)) {
      throw new Error('عذراً، هذا الطلب مغلق حالياً ولا يستقبل عروض أسعار جديدة.');
    }

    // 🛡️ SECURITY: Validate positive bid price
    const bidPrice = Number(validated.netPrice);
    if (bidPrice <= 0 || !Number.isFinite(bidPrice)) {
      throw new Error('يجب تحديد سعر صحيح أكبر من صفر.');
    }
    
    // Additional validation: maximum reasonable bid price
    if (bidPrice > MAX_BID_PRICE) {
      throw new Error(`سعر العرض يتجاوز الحد الأقصى المسموح (${MAX_BID_PRICE.toLocaleString()} ج.م).`);
    }

    const existingBid = await tx.bid.findUnique({
      where: { requestId_vendorId: { requestId: validated.requestId, vendorId } }
    });

    if (existingBid) {
      throw new Error('لقد قمت بتقديم عرض سعر لهذا الطلب مسبقاً.');
    }

    const settings = await tx.platformSetting.findFirst({ orderBy: { id: 'desc' } });
    const commissionPercent = settings ? Number(settings.commissionPercent) : DEFAULT_COMMISSION_PERCENT;
    
    // Use precise Decimal arithmetic
    const { d, mul, div, add, toNumber, toTwo } = await import('../../utils/decimal');

    const netPrice = d(validated.netPrice);
    const commissionMultiplier = add(1, div(commissionPercent, 100));
    const clientPrice = toTwo(mul(netPrice, commissionMultiplier));

    const bid = await tx.bid.create({
      data: {
        requestId: validated.requestId,
        vendorId,
        description: validated.description,
        duration: validated.duration,
        netPrice: validated.netPrice,
        clientPrice: clientPrice,
        status: 'PENDING',
      },
    });

    if (request.status === 'OPEN_FOR_BIDDING') {
      await tx.request.update({
        where: { id: validated.requestId },
        data: { status: 'BIDS_RECEIVED' },
      });
    }

    // REAL-TIME NOTIFICATION
    await Notify.newBid(request.clientId, request.id, Number(bid.clientPrice));

    return bid;
  });
}

