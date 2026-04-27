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
            ? { vendorId: userId }     // Vendors see only their own bid
            : userRole === 'CLIENT'
              ? { status: { in: ['SELECTED', 'ACCEPTED_BY_CLIENT'] } } // Client sees only forwarded bids
              : userRole === 'DELIVERY'
                ? { status: 'ACCEPTED_BY_CLIENT' } // Delivery sees only the winning bid (no pricing)
                : {},                 // Admins see all
        select: {
          id: true,
          vendorId: true,
          description: true,
          netPrice: userRole !== 'DELIVERY', // Delivery agents must not see financial data
          clientPrice: userRole !== 'DELIVERY',
          status: true,
          images: true,
          vendor: { select: { id: true, fullName: true } },
        },
      },
    },
  });

  // --- ANONYMIZATION LOGIC ---
  if (request) {
    // 1. Hide Client Name from anyone except Admin or Owner
    if (userRole !== 'ADMIN' && request.clientId !== userId) {
      if (request.client) {
        request.client.fullName = `عميل #${request.client.id}`;
      }
    }

    // 2. Hide Vendor Names from Client until accepted? 
    // Actually, per user request, client shouldn't see vendor names at all during bidding.
    if (userRole === 'CLIENT') {
      request.bids.forEach(bid => {
        if (bid.vendor) {
          bid.vendor.fullName = `مورد معتمد #${bid.vendor.id}`;
        }
      });
    }

    // 3. Mask sensitive data based on logic
    const isOwner = userRole === 'CLIENT' && request.clientId === userId;
    const isAdmin = userRole === 'ADMIN';
    const isAssignedRider = userRole === 'DELIVERY' && request.assignedDeliveryAgentId === userId;
    
    // Check if this vendor is the one who won the bid
    const isWinningVendor = userRole === 'VENDOR' && request.bids.some(b => b.vendorId === userId && b.status === 'ACCEPTED_BY_CLIENT');

    const canSeeSensitiveInfo = isAdmin || isOwner || isAssignedRider || isWinningVendor;

    if (!canSeeSensitiveInfo) {
      (request as any).address = 'العنوان متاح فقط للمورد المقبول';
      (request as any).deliveryPhone = 'رقم الهاتف متاح بعد الدفع';
      (request as any).notes = 'الملاحظات الإضافية متاحة للمورد المختار';
    }
  }

  return request;
}

