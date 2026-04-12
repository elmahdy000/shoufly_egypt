import { prisma } from '@/lib/prisma';

export async function listDeliveryTimeline(requestId: number, clientId: number) {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    select: { id: true, clientId: true, status: true },
  });

  if (!request) {
    throw new Error('Request not found');
  }

  if (request.clientId !== clientId) {
    throw new Error('Forbidden');
  }

  const timeline = await prisma.deliveryTracking.findMany({
    where: { requestId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });

  return {
    requestId,
    requestStatus: request.status,
    currentDeliveryStatus: timeline.length ? timeline[timeline.length - 1].status : null,
    timeline,
  };
}
