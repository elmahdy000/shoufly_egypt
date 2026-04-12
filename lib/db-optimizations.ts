/**
 * Database Query Optimizations
 * Prevents N+1 queries and optimizes common patterns
 */

import { prisma } from './prisma';

/**
 * Optimized request fetching with all related data
 * Prevents N+1 query problem
 */
export async function getRequestWithDetails(requestId: number) {
  return prisma.request.findUnique({
    where: { id: requestId },
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      category: true,
      bids: {
        include: {
          vendor: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      selectedBid: {
        include: {
          vendor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
      } as any,
      deliveryTracking: {
        orderBy: { createdAt: 'desc' },
        take: 10, // Limit tracking history
      },
      review: true,
      _count: {
        select: {
          bids: true,
          deliveryTracking: true,
        },
      },
    },
  });
}

/**
 * Optimized vendor dashboard data
 */
export async function getVendorDashboardData(vendorId: number) {
  const [
    activeBids,
    acceptedBids,
    totalEarnings,
    openRequests,
  ] = await Promise.all([
    // Active bids count
    prisma.bid.count({
      where: { vendorId, status: 'PENDING' },
    }),
    
    // Accepted bids count
    prisma.bid.count({
      where: { vendorId, status: 'ACCEPTED_BY_CLIENT' },
    }),
    
    // Total earnings (accepted bids)
    prisma.bid.aggregate({
      where: {
        vendorId,
        status: 'ACCEPTED_BY_CLIENT',
      },
      _sum: { netPrice: true },
    }),
    
    // Open requests count (for browsing)
    prisma.request.count({
      where: { status: 'OPEN_FOR_BIDDING' },
    }),
  ]);

  // Recent bids with minimal data
  const recentBids = await prisma.bid.findMany({
    where: { vendorId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      netPrice: true,
      clientPrice: true,
      status: true,
      createdAt: true,
      request: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  return {
    stats: {
      activeBids,
      acceptedBids,
      totalEarnings: totalEarnings._sum.netPrice || 0,
      openRequests,
    },
    recentBids,
  };
}

/**
 * Optimized client dashboard data
 */
export async function getClientDashboardData(clientId: number) {
  const [
    totalRequests,
    openRequests,
    completedRequests,
    walletBalance,
  ] = await Promise.all([
    prisma.request.count({ where: { clientId } }),
    prisma.request.count({ 
      where: { 
        clientId, 
        status: { in: ['PENDING_ADMIN_REVISION', 'OPEN_FOR_BIDDING', 'OFFERS_FORWARDED'] }
      }
    }),
    prisma.request.count({ 
      where: { clientId, status: 'CLOSED_SUCCESS' }
    }),
    prisma.user.findUnique({
      where: { id: clientId },
      select: { walletBalance: true },
    }),
  ]);

  // Recent requests with minimal data
  const recentRequests = await prisma.request.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      _count: {
        select: { bids: true },
      },
    },
  });

  return {
    stats: {
      totalRequests,
      openRequests,
      completedRequests,
      walletBalance: walletBalance?.walletBalance || 0,
    },
    recentRequests,
  };
}

/**
 * Optimized delivery agent dashboard data
 */
export async function getDeliveryDashboardData(agentId: number) {
  const [
    availableTasks,
    activeDeliveries,
    completedToday,
    totalCompleted,
  ] = await Promise.all([
    // Available tasks
    prisma.request.count({
      where: {
        status: 'ORDER_PAID_PENDING_DELIVERY',
        deliveryTracking: {
          some: { status: 'READY_FOR_PICKUP' },
        },
      },
    }),
    
    // Active deliveries for this agent
    prisma.deliveryTracking.count({
      where: {
        status: 'OUT_FOR_DELIVERY',
        request: {
          deliveryTracking: {
            some: {
              note: { contains: `Assigned to agent #${agentId}` },
            },
          },
        },
      },
    }),
    
    // Completed today
    prisma.deliveryTracking.count({
      where: {
        status: 'DELIVERED',
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    
    // Total completed
    prisma.deliveryTracking.count({
      where: { status: 'DELIVERED' },
    }),
  ]);

  return {
    stats: {
      availableTasks,
      activeDeliveries,
      completedToday,
      totalCompleted,
    },
  };
}

/**
 * Optimized admin dashboard data
 */
export async function getAdminDashboardData() {
  const [
    totalUsers,
    pendingVendors,
    pendingRequests,
    totalRevenue,
    todayTransactions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ 
      where: { 
        role: { in: ['VENDOR', 'DELIVERY'] },
        isActive: false 
      }
    }),
    prisma.request.count({ 
      where: { status: 'PENDING_ADMIN_REVISION' }
    }),
    prisma.transaction.aggregate({
      where: { type: 'ADMIN_COMMISSION' },
      _sum: { amount: true },
    }),
    prisma.transaction.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  // Recent activity (last 10 transactions)
  const recentActivity = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      type: true,
      amount: true,
      createdAt: true,
      user: {
        select: {
          fullName: true,
          role: true,
        },
      },
    },
  });

  return {
    stats: {
      totalUsers,
      pendingVendors,
      pendingRequests,
      totalRevenue: totalRevenue._sum.amount || 0,
      todayTransactions,
    },
    recentActivity,
  };
}

/**
 * Paginated query helper with cursor-based pagination
 */
export async function getPaginatedRequests(
  where: any,
  cursor?: number,
  limit: number = 10
) {
  const requests = await prisma.request.findMany({
    where,
    take: limit + 1, // Take one extra to check if there are more
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      address: true,
      createdAt: true,
      _count: {
        select: { bids: true },
      },
    },
  });

  const hasMore = requests.length > limit;
  const items = hasMore ? requests.slice(0, limit) : requests;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return {
    items,
    nextCursor,
    hasMore,
  };
}

/**
 * Batch operations for better performance
 */
export async function batchUpdateStatus(
  ids: number[],
  model: 'request' | 'bid' | 'user',
  status: string
) {
  const where = { id: { in: ids } };
  
  switch (model) {
    case 'request':
      return prisma.request.updateMany({ where, data: { status } });
    case 'bid':
      return prisma.bid.updateMany({ where, data: { status } });
    case 'user':
      return prisma.user.updateMany({ where, data: { isActive: status === 'active' } });
    default:
      throw new Error(`Unknown model: ${model}`);
  }
}
