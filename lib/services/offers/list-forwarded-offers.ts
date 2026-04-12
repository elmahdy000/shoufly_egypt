import { prisma } from '@/lib/prisma';

export async function listForwardedOffers(requestId: number, clientId: number) {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    select: { id: true, clientId: true },
  });

  if (!request) {
    throw new Error('Request not found');
  }

  if (request.clientId !== clientId) {
    throw new Error('Forbidden');
  }

  const offers = await prisma.bid.findMany({
    where: {
      requestId,
      status: 'SELECTED',
    },
    include: {
      vendor: { select: { id: true, fullName: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return offers;
}
