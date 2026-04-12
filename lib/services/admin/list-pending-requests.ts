import { prisma } from '@/lib/prisma';

export async function listPendingRequests() {
  const requests = await prisma.request.findMany({
    where: { status: 'PENDING_ADMIN_REVISION' },
    include: {
      category: true,
      client: { select: { id: true, fullName: true, email: true } },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return requests;
}
