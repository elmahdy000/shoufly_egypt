import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function cancelRequest(params: {
  requestId: number;
  userId: number;
  role: string;
}) {
  const { requestId, userId, role } = params;
  logger.info('request.cancel.started', { requestId, userId, role });

  return prisma.$transaction(async (tx) => {
    const request = await tx.request.findUnique({
      where: { id: requestId },
      select: { id: true, clientId: true, status: true },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    // Security: Only client (owner) or Admin can cancel
    if (role !== 'ADMIN' && request.clientId !== userId) {
      throw new Error('Unauthorized to cancel this request');
    }

    // Business Logic: Can only cancel if not yet paid/settled
    const cancellableStates = ['PENDING_ADMIN_REVISION', 'OPEN_FOR_BIDDING', 'BIDS_RECEIVED', 'OFFERS_FORWARDED'];
    if (!cancellableStates.includes(request.status)) {
      throw new Error(`Cannot cancel request in status ${request.status}. Please contact support for refunds if already paid.`);
    }

    const updated = await tx.request.update({
      where: { id: requestId },
      data: { status: 'CLOSED_CANCELLED' },
    });

    logger.info('request.cancel.completed', { requestId, userId });

    return updated;
  });
}
