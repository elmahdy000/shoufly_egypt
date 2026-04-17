import { prisma } from '../../prisma';
import { Notify } from '../notifications/hub';

/**
 * Service to allow a client to dispute an order after delivery.
 * This freeze the funds in Escrow and prevents the vendor/agent from being paid.
 */
export async function disputeOrder(clientId: number, requestId: number, reason: string) {
  // 1. Verify the request belongs to the client and is in a state allow dispute
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { client: true, transactions: true }
  });

  if (!request || request.clientId !== clientId) {
    throw new Error('Unauthorized or request not found.');
  }

  // 2. Check if the request is already completed/paid out
  if (request.status === 'CLOSED_SUCCESS') {
    throw new Error('Order already settled and completed. Please contact support for legacy refund.');
  }

  // 3. Find the reported user (the vendor from the accepted bid)
  const acceptedBid = await prisma.bid.findFirst({
    where: { requestId: requestId, status: 'ACCEPTED_BY_CLIENT' }
  });

  // 4. Create a formal Complaint linked to the reported vendor
  const complaint = await prisma.complaint.create({
    data: {
      requestId: requestId,
      userId: clientId,
      reportedUserId: acceptedBid?.vendorId || null,
      subject: 'نزاع مالي - جودة الخدمة/المنتج',
      description: reason,
      status: 'OPEN'
    }
  });

  // 4. Mark the request as "REJECTED" or "UNDER_REVIEW" (Let's use a custom status if we had one)
  // For now, let's keep it under the complaint status but mark the request as PENDING_ADMIN_REVISION again
  await prisma.request.update({
    where: { id: requestId },
    data: { status: 'REJECTED' } // This blocks payout logic
  });

  // 5. Notify the vendor about the dispute
  if (acceptedBid?.vendorId) {
    await Notify.disputeRaised(acceptedBid.vendorId, requestId, reason);
  }

  console.log(`⚠️ DISPUTE RAISED: Request #${requestId} is now frozen. Admin notified.`);

  return { success: true, complaintId: complaint.id };
}
