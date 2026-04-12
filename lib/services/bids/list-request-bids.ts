import { prisma } from '@/lib/prisma';

export async function listRequestBids(requestId: number) {
  const bids = await prisma.bid.findMany({
    where: { requestId },
    include: {
      vendor: { select: { id: true, fullName: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return bids;
}
