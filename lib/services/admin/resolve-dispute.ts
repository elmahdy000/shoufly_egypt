import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { Notify } from '../notifications/hub';
import { d, toTwo, sub, mul, toNumber } from '@/lib/utils/decimal';

export async function resolveDispute(adminId: number, requestId: number, penaltyPercentage: number) {
  logger.info('admin.resolve_dispute.started', { adminId, requestId, penaltyPercentage });

  if (penaltyPercentage < 0 || penaltyPercentage > 100) {
    throw new Error('Penalty percentage must be between 0 and 100');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Fetch Request Details
    const request = await tx.request.findUnique({
      where: { id: requestId },
      include: {
        bids: { where: { status: 'ACCEPTED_BY_CLIENT' } }
      }
    });

    if (!request) throw new Error('Request not found');

    // Make sure it is legally able to be disputed/refunded
    // NOTE: after markReturned / markFailedDelivery the request becomes CLOSED_CANCELLED —
    // admin must still be able to resolve escrow distribution in that state.
    const validStates = ['ORDER_PAID_PENDING_DELIVERY', 'CLOSED_CANCELLED', 'PENDING_ADMIN_REVISION'];
    if (!validStates.includes(request.status)) {
        throw new Error(`لا يمكن حل نزاع على طلب في الحالة "${request.status}". يجب أن يكون الطلب مدفوعاً أو مغلقاً بانتظار المراجعة.`);
    }

    const acceptedBid = request.bids[0];
    if (!acceptedBid) throw new Error('No accepted bid found for this request');

    // 2. Find Escrow Deposit
    const escrowTransaction = await tx.transaction.findFirst({
        where: {
            requestId: request.id,
            userId: request.clientId,
            type: 'ESCROW_DEPOSIT'
        }
    });

    if (!escrowTransaction) {
        throw new Error('No escrow payment found for this request. Cannot resolve dispute.');
    }

    const escrowTotal      = toTwo(Number(escrowTransaction.amount));

    // 3. Calculate Math
    const netPrice          = d(acceptedBid.netPrice);
    const adminCommission   = toTwo(sub(escrowTotal, netPrice));                   // platform's cut (always retained)
    const compensationAmount = toTwo(mul(netPrice, penaltyPercentage / 100));     // vendor gets this
    const refundAmount      = toTwo(sub(netPrice, compensationAmount));           // client gets this back

    // 4. Refund Client (their portion of the vendor's net price)
    if (refundAmount.greaterThan(0)) {
        await tx.user.update({
            where: { id: request.clientId },
            data: { walletBalance: { increment: toNumber(refundAmount) } }
        });

        await tx.transaction.create({
            data: {
                userId: request.clientId,
                requestId: request.id,
                amount: toNumber(refundAmount),
                type: 'REFUND',
                description: `استرداد أموال بعد تسوية نزاع (خصم ${penaltyPercentage}%) للطلب رقم #${request.id}`
            }
        });

        await Notify.disputeResolved(request.clientId, request.id, 'CLIENT', toNumber(refundAmount));
    }

    // 5. Compensate Vendor (their penalty share of net price)
    if (compensationAmount.greaterThan(0)) {
        await tx.user.update({
            where: { id: acceptedBid.vendorId },
            data: { walletBalance: { increment: toNumber(compensationAmount) } }
        });

        await tx.transaction.create({
            data: {
                userId: acceptedBid.vendorId,
                requestId: request.id,
                amount: toNumber(compensationAmount),
                type: 'VENDOR_PAYOUT',
                description: `تعويض نزاع (${penaltyPercentage}% من سعر ${toNumber(netPrice)} ج.م) للطلب المتعثر رقم #${request.id}`
            }
        });

        await Notify.disputeResolved(acceptedBid.vendorId, request.id, 'VENDOR', toNumber(compensationAmount));
    }

    // 6. Record platform commission (properly add to admin wallet)
    if (adminCommission.greaterThan(0)) {
        // Find the admin to receive the funds
        const systemAdmin = await tx.user.findFirst({
            where: { role: 'ADMIN' },
            orderBy: { id: 'asc' },
            select: { id: true }
        });

        if (systemAdmin) {
            await tx.user.update({
                where: { id: systemAdmin.id },
                data: { walletBalance: { increment: toNumber(adminCommission) } }
            });

            await tx.transaction.create({
                data: {
                    userId: systemAdmin.id,
                    requestId: request.id,
                    amount: toNumber(adminCommission),
                    type: 'ADMIN_COMMISSION',
                    description: `عمولة المنصة مستقطعة من النزاع للطلب رقم #${request.id}`
                }
            });
            logger.info('admin.resolve_dispute.commission_credited', { requestId: request.id, adminId: systemAdmin.id, adminCommission: toNumber(adminCommission) });
        }
    }

    // 7. Close the request definitively
    const closedReq = await tx.request.update({
        where: { id: request.id },
        data: {
            status: 'CLOSED_CANCELLED',
            notes: `تم حل النزاع بواسطة الأدمن رقم #${adminId}. الغرامة: ${penaltyPercentage}%. عمولة المنصة المستقطعة: ${adminCommission} ج.م.`
        }
    });

    logger.info('admin.resolve_dispute.completed', {
        requestId: request.id,
        escrowTotal,
        adminCommission,
        refundAmount,
        compensationAmount
    });

    return {
        requestId: request.id,
        status: closedReq.status,
        escrowTotal,
        adminCommissionRetained: adminCommission,
        clientRefunded: refundAmount,
        vendorCompensated: compensationAmount
    };
  });
}
