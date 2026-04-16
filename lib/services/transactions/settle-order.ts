import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { d, toTwo, sub, mul, min, toNumber } from '@/lib/utils/decimal';
import Decimal from 'decimal.js';

export async function settleOrder(requestId: number) {
  logger.info('qr.confirm.settlement.started', { requestId });
  return prisma.$transaction(async (tx) => {
    const request = await tx.request.findUnique({
      where: { id: requestId },
      include: {
        bids: {
          where: { status: 'ACCEPTED_BY_CLIENT' },
          select: { id: true, vendorId: true, netPrice: true, clientPrice: true },
        },
        deliveryTracking: {
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: 1,
          select: { status: true },
        },
        transactions: {
          where: { type: { in: ['VENDOR_PAYOUT', 'ADMIN_COMMISSION', 'REFUND'] } },
          select: { id: true, type: true },
        },
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status === 'CLOSED_SUCCESS') {
      throw new Error('Request already settled');
    }

    // SECURITY: Prevent settlement if request was cancelled or refunded
    if (request.status === 'CLOSED_CANCELLED') {
      throw new Error('Cannot settle cancelled request');
    }

    // Check for any REFUND transactions
    const refundTransaction = request.transactions.find((t) => t.type === 'REFUND');
    if (refundTransaction) {
      throw new Error('Cannot settle request - refund was already issued');
    }

    if (!request.selectedBidId) {
      throw new Error('Request has no selected bid');
    }

    const selectedBid = request.bids.find((b) => b.id === request.selectedBidId);
    if (!selectedBid) {
      throw new Error('Accepted selected bid not found');
    }

    const existingPayout = request.transactions.find((t) => t.type === 'VENDOR_PAYOUT');
    const existingCommission = request.transactions.find((t) => t.type === 'ADMIN_COMMISSION');

    if (existingPayout || existingCommission) {
      throw new Error('Settlement already recorded for this request');
    }

    const platform = await tx.platformSetting.findFirst({
      orderBy: { id: 'desc' },
      select: { commissionPercent: true },
    });
    if (!platform) {
      throw new Error('Platform settings missing');
    }

    const admin = await tx.user.findFirst({
      where: { role: 'ADMIN' },
      orderBy: { id: 'asc' },
      select: { id: true },
    });
    if (!admin) {
      throw new Error('Admin user not found');
    }

    // Use precise Decimal arithmetic for financial calculations
    const netPrice = toTwo(selectedBid.netPrice);
    const clientPrice = toTwo(selectedBid.clientPrice);
    const totalSpread = toTwo(sub(clientPrice, netPrice));
    
    // Calculate Delivery Agent Pay if exists
    let riderPayout = d(0);
    if (request.assignedDeliveryAgentId) {
       // Fixed delivery fee of 20 EGP or 50% of spread if spread is too low
       const calculatedFee = toTwo(mul(totalSpread, 0.5));
       riderPayout = min(20, calculatedFee);
    }
    
    const finalCommission = toTwo(sub(totalSpread, riderPayout));
    const vendorPayout = netPrice;

    // 1. Pay Vendor
    await tx.user.update({
      where: { id: selectedBid.vendorId },
      data: { walletBalance: { increment: toNumber(vendorPayout) } },
    });

    // 2. Pay Admin
    await tx.user.update({
      where: { id: admin.id },
      data: { walletBalance: { increment: toNumber(finalCommission) } },
    });

    // 3. Pay Rider (New!)
    if (request.assignedDeliveryAgentId && riderPayout.greaterThan(0)) {
        await tx.user.update({
            where: { id: request.assignedDeliveryAgentId },
            data: { walletBalance: { increment: toNumber(riderPayout) } }
        });

        await tx.transaction.create({
            data: {
              userId: request.assignedDeliveryAgentId,
              requestId,
              amount: toNumber(riderPayout),
              type: 'DELIVERY_PAYOUT',
              description: `أجرة توصيل الطلب رقم #${requestId}`,
            },
        });

        await tx.notification.create({
            data: {
              userId: request.assignedDeliveryAgentId,
              type: 'PAYMENT_RECEIVED',
              title: 'تم استلام أجر التوصيل',
              message: `تم إضافة ${riderPayout.toNumber()} ج.م لمحفظتك مقابل الطلب #${requestId}`,
            },
        });
    }

    // Record Vendor/Admin transactions
    await tx.transaction.create({
      data: {
        userId: selectedBid.vendorId,
        requestId,
        amount: toNumber(vendorPayout),
        type: 'VENDOR_PAYOUT',
        description: `Vendor payout for request #${requestId}`,
      },
    });

    await tx.transaction.create({
      data: {
        userId: admin.id,
        requestId,
        amount: toNumber(finalCommission),
        type: 'ADMIN_COMMISSION',
        description: `Admin commission for request #${requestId}`,
      },
    });

    if (request.deliveryTracking[0]?.status !== 'DELIVERED') {
      await tx.deliveryTracking.create({
        data: {
          requestId,
          status: 'DELIVERED',
          note: 'Delivery confirmed by client',
        },
      });
    }

    await tx.request.update({
      where: { id: requestId },
      data: { status: 'CLOSED_SUCCESS' },
    });

    // Notifications...
    await tx.notification.create({
      data: {
        userId: request.clientId,
        type: 'DELIVERY_UPDATE',
        title: 'Order Completed',
        message: `Request #${requestId} was confirmed and closed successfully.`,
      },
    });

    await tx.notification.create({
      data: {
        userId: selectedBid.vendorId,
        type: 'PAYMENT_RECEIVED',
        title: 'Payout Recorded',
        message: `Payout for request #${requestId} was recorded.`,
      },
    });

    logger.info('notification.created', {
      event: 'order.settled',
      requestId,
      recipients: [request.clientId, selectedBid.vendorId],
    });

    logger.info('qr.confirm.settlement.completed', {
      requestId,
      vendorPayout: toNumber(vendorPayout),
      adminCommission: toNumber(finalCommission),
    });

    return {
      requestId,
      finalRequestStatus: 'CLOSED_SUCCESS' as const,
      vendorPayout: toNumber(vendorPayout),
      adminCommission: toNumber(finalCommission),
      deliveryFinalStatus: 'DELIVERED' as const,
    };
  });
}
