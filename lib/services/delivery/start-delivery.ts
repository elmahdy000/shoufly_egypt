import { prisma } from '@/lib/prisma';

export async function startDelivery(requestId: number) {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      deliveryTracking: {
        where: { status: 'ORDER_PLACED' },
        select: { id: true },
      },
    },
  });

  if (!request) {
    throw new Error('Request not found');
  }

  if (request.status !== 'ORDER_PAID_PENDING_DELIVERY') {
    throw new Error('Cannot start delivery before successful payment');
  }

  if (request.deliveryTracking.length > 0) {
    return { requestId, started: false };
  }

  await prisma.deliveryTracking.create({
    data: {
      requestId,
      status: 'ORDER_PLACED',
      note: 'Order placed',
    },
  });

  return { requestId, started: true };
}
