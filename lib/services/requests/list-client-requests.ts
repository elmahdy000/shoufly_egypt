import { prisma } from '@/lib/prisma';

export async function listClientRequests(clientId: number, limit = 20, offset = 0) {
  const requests = await prisma.request.findMany({
    where: { clientId },
    include: {
      category: true,
      client: { select: { id: true, fullName: true } },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  return requests;
}

