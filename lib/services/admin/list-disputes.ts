import { prisma } from '@/lib/prisma';

/**
 * Retrieves a list of requests that are currently in a state requiring 
 * admin intervention (Disputes, Complaints, or Stuck Deliveries).
 */
export async function listActiveDisputes(limit = 20, offset = 0) {
  return prisma.request.findMany({
    where: {
      OR: [
        { status: 'CLOSED_CANCELLED', notes: { contains: 'AI' } }, // AI Flagged
        { 
          deliveryTracking: {
            some: { status: { in: ['FAILED_DELIVERY', 'RETURNED'] } }
          }
        },
        {
            complaints: {
                some: { status: 'OPEN' }
            }
        }
      ]
    },
    include: {
      client: { select: { id: true, fullName: true, phone: true } },
      complaints: true,
      deliveryTracking: {
          orderBy: { createdAt: 'desc' },
          take: 1
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    skip: offset
  });
}
