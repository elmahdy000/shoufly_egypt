import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

function toTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Resolves a failed order (FAILED_DELIVERY or RETURNED)
 * by penalizing the ghost/no-show client by a specific percentage.
 * 
 * @param adminId User ID of the Admin
 * @param requestId The ID of the failed request
 * @param penaltyPercentage 0 to 100. (e.g., 20 means Client gets 80% refund, Vendor gets 20% compensation)
 */
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
    const validStates = ['FAILED_DELIVERY', 'RETURNED', 'ORDER_PAID_PENDING_DELIVERY'];
    if (!validStates.includes(request.status)) {
        throw new Error(`Cannot dispute request in status ${request.status}. Must be FAILED_DELIVERY or RETURNED.`);
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

    const escrowTotal = Number(escrowTransaction.amount);

    // 3. Calculate Math
    const compensationAmount = toTwo(escrowTotal * (penaltyPercentage / 100));
    const refundAmount = toTwo(escrowTotal - compensationAmount);

    // 4. Refund Client
    if (refundAmount > 0) {
        await tx.user.update({
            where: { id: request.clientId },
            data: { walletBalance: { increment: refundAmount } }
        });

        await tx.transaction.create({
            data: {
                userId: request.clientId,
                requestId: request.id,
                amount: refundAmount,
                type: 'REFUND',
                description: `Refund after ${penaltyPercentage}% dispute penalty for Request #${request.id}`
            }
        });

        await tx.notification.create({
            data: {
                userId: request.clientId,
                type: 'REFUND_ISSUED',
                title: 'Dispute Resolved',
                message: `Your request was cancelled. You received a partial refund of ${refundAmount} EGP (Penalty applied: ${penaltyPercentage}%).`
            }
        });
    }

    // 5. Compensate Vendor
    if (compensationAmount > 0) {
        await tx.user.update({
            where: { id: acceptedBid.vendorId },
            data: { walletBalance: { increment: compensationAmount } }
        });

        await tx.transaction.create({
            data: {
                userId: acceptedBid.vendorId,
                requestId: request.id,
                amount: compensationAmount,
                type: 'VENDOR_PAYOUT',
                description: `Dispute compensation (${penaltyPercentage}% of escrow) for Failed Request #${request.id}`
            }
        });

        await tx.notification.create({
            data: {
                userId: acceptedBid.vendorId,
                type: 'PAYMENT_RECEIVED',
                title: 'Compensation Received',
                message: `You received ${compensationAmount} EGP as compensation for the cancelled/failed request #${request.id}.`
            }
        });
    }

    // 6. Close the request definitively
    const closedReq = await tx.request.update({
        where: { id: request.id },
        data: {
            status: 'CLOSED_CANCELLED',
            notes: `Dispute resolved by Admin #${adminId}. Penalty: ${penaltyPercentage}%.`
        }
    });

    logger.info('admin.resolve_dispute.completed', {
        requestId: request.id,
        refundAmount,
        compensationAmount
    });

    return {
        requestId: request.id,
        status: closedReq.status,
        clientRefunded: refundAmount,
        vendorCompensated: compensationAmount
    };
  });
}
