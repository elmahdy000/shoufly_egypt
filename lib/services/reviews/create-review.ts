import { prisma } from '@/lib/prisma';

export async function createReview(params: {
  requestId: number;
  reviewerId: number;
  rating: number;
  comment?: string;
}) {
  const { requestId, reviewerId, rating, comment } = params;

  // 1. Validate request state
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { bids: { where: { status: 'ACCEPTED_BY_CLIENT' } } }
  });

  if (!request) throw new Error('Request not found');
  if (request.status !== 'CLOSED_SUCCESS') {
    throw new Error('Can only review completed orders');
  }

  if (request.clientId !== reviewerId) {
    throw new Error('Only the client who created the request can leave a review');
  }

  const selectedBid = request.bids[0];
  if (!selectedBid) throw new Error('No vendor found for this request');

  // 2. Create Review
  return prisma.review.create({
    data: {
      requestId,
      reviewerId,
      reviewedId: selectedBid.vendorId, // Currently reviewing the vendor
      rating,
      comment,
    },
    include: {
        reviewed: { select: { fullName: true } }
    }
  });
}
