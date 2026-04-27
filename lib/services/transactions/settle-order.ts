import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { d, toTwo, sub, mul, min, toNumber } from '@/lib/utils/decimal';
import { Notify } from '../notifications/hub';
import { TransactionType } from '@/app/generated/prisma';
import { MAX_DELIVERY_FEE, DELIVERY_FEE_PERCENTAGE } from '@/lib/constants/business';

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
          select: { id: true, type: true, amount: true },
        },
      },
    });

    if (!request) {
      throw new Error('الطلب غير موجود.');
    }

    if (request.status === 'CLOSED_SUCCESS') {
      logger.info('order.settle.already_closed', { requestId });
      return { success: true, alreadySettled: true };
    }

    // SECURITY: Prevent settlement if request was cancelled or refunded
    if (request.status === 'CLOSED_CANCELLED') {
      throw new Error('لا يمكن تسوية طلب ملغي.');
    }

    // Check for any REFUND transactions
    const refundTransaction = request.transactions.find((t) => t.type === 'REFUND');
    if (refundTransaction) {
      throw new Error('لا يمكن التسوية، تم رد الأموال لهذا الطلب بالفعل.');
    }

    if (!request.selectedBidId) {
      throw new Error('الطلب ليس له عرض سعر محدد حالياً.');
    }

    const selectedBid = request.bids.find((b) => b.id === request.selectedBidId);
    if (!selectedBid) {
      throw new Error('لم يتم العثور على عرض السعر المقبول لهذا الطلب.');
    }

    const existingPayout = request.transactions.find((t) => t.type === 'VENDOR_PAYOUT');
    const existingCommission = request.transactions.find((t) => t.type === 'ADMIN_COMMISSION');

    if (existingPayout || existingCommission) {
      logger.info('order.settle.already_settled', { requestId });
      return { 
        success: true, 
        alreadySettled: true, 
        adminCommission: Number(existingCommission?.amount || 0) 
      };
    }

    const platform = await tx.platformSetting.findFirst({
      orderBy: { id: 'desc' },
      select: { commissionPercent: true },
    });
    if (!platform) {
      throw new Error('إعدادات المنصة غير متوفرة، يرجى مراجعة الإدارة.');
    }

    const admin = await tx.user.findFirst({
      where: { role: 'ADMIN' },
      orderBy: { id: 'asc' },
      select: { id: true },
    });
    if (!admin) {
      throw new Error('لا يوجد حساب أدمن متاح لإتمام التسوية.');
    }

    // ─── Financial Settlement Math ───────────────────────────────────────
    // clientPrice was set at bid creation time as:
    //   clientPrice = netPrice + (netPrice × commissionPercent%)
    //
    // Therefore: totalSpread = clientPrice - netPrice = platform's margin
    //   This equals exactly (netPrice × commissionPercent%) — same result,
    //   computed from the already-persisted prices to avoid rounding drift.
    //
    // Distribution:
    //   riderPayout      = min(20, totalSpread × 50%)  ← delivery agent fee
    //   finalCommission  = totalSpread - riderPayout    ← platform revenue
    //   vendorPayout     = netPrice                     ← vendor's net amount
    //
    // Integrity check: vendorPayout + riderPayout + finalCommission = clientPrice ✅
    // ──────────────────────────────────────────────────────────────────────
    const netPrice = toTwo(selectedBid.netPrice);
    const clientPrice = toTwo(selectedBid.clientPrice);
    
    // 🛡️ SECURITY: Validate positive amounts
    if (netPrice.lessThanOrEqualTo(0) || clientPrice.lessThanOrEqualTo(0)) {
      throw new Error('أسعار الطلب يجب أن تكون أكبر من صفر.');
    }
    
    const totalSpread = toTwo(sub(clientPrice, netPrice));

    // Calculate Delivery Agent Pay if exists
    let riderPayout = d(0);
    if (request.assignedDeliveryAgentId) {
      // Fixed delivery fee with cap and percentage of spread
      const calculatedFee = toTwo(mul(totalSpread, DELIVERY_FEE_PERCENTAGE));
      riderPayout = min(MAX_DELIVERY_FEE, calculatedFee);
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

        await Notify.send({
            userId: request.assignedDeliveryAgentId,
            type: 'PAYMENT_RECEIVED',
            title: 'تم استلام أجر التوصيل',
            message: `تم إضافة ${riderPayout.toNumber()} ج.م لمحفظتك مقابل الطلب #${requestId}`,
            requestId,
        }, tx);
    }

    // Record Vendor/Admin transactions
    await tx.transaction.create({
      data: {
        userId: selectedBid.vendorId,
        requestId,
        amount: toNumber(vendorPayout),
        type: 'VENDOR_PAYOUT',
        description: `تسوية مستحقات المورد للطلب رقم #${requestId}`,
      },
    });

    await tx.transaction.create({
      data: {
        userId: admin.id,
        requestId,
        amount: toNumber(finalCommission),
        type: 'ADMIN_COMMISSION',
        description: `عمولة المنصة للطلب رقم #${requestId}`,
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

    // Real-time Notifications
    await Notify.orderCompleted(request.clientId, requestId);
    await Notify.payoutReceived(selectedBid.vendorId, requestId, toNumber(vendorPayout));

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
      riderPayout: toNumber(riderPayout),
      totalAmount: toNumber(clientPrice),
      deliveryFinalStatus: 'DELIVERED' as const,
    };
  }, { timeout: 20000 }); // Increased timeout for stability under massive load
}
