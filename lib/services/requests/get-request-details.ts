import { prisma } from '@/lib/prisma';

import { UserRole } from '@/lib/validations/auth';

export async function getRequestDetails(params: {
  requestId: number;
  userId: number;
  userRole: UserRole;
}) {
  const { requestId, userId, userRole } = params;

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      category: true,
      client: { 
        select: { 
          id: true, 
          fullName: true, 
          email: userRole === 'ADMIN' // Only admins see email for verification
        } 
      },
      images: true,
      review: true,
      deliveryTracking: {
        orderBy: { createdAt: 'desc' }
      },
      deliveryAgent: {
        select: {
            id: true,
            fullName: true,
            phone: true // Client needs to call the rider
        }
      },
      bids: {
        where:
          userRole === 'VENDOR'
            ? { vendorId: userId } // Vendors only see their own bid
            : userRole === 'CLIENT'
              ? {} // Clients see all bids forwarded to them
              : {}, // Admins see all
        select: {
          id: true,
          vendorId: true,
          description: true,
          netPrice: true,
          clientPrice: true,
          status: true,
          images: true,
          vendor: { select: { id: true, fullName: true } },

        },
      },
    },
  });

  if (!request) {
    throw new Error('Request not found');
  }

  // Final authorization check
  if (userRole === 'CLIENT' && request.clientId !== userId) {
    throw new Error('Forbidden');
  }

  return request;
}

