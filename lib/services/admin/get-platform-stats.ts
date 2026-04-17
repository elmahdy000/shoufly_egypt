import { prisma } from "../../prisma";

export async function getPlatformStats() {
  const [
    totalUsers,
    totalVendors,
    openRequests,
    pendingAiReview, // Requests flagged by Watchtower
    activeDeliveries, // Pilots currently moving
    totalGMVResult,
    recentRequests,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'VENDOR' } }),
    prisma.request.count({ where: { status: 'OPEN_FOR_BIDDING' } }),
    prisma.request.count({ where: { status: 'PENDING_ADMIN_REVISION' } }),
    prisma.request.count({ where: { status: 'ORDER_PAID_PENDING_DELIVERY' } }),
    prisma.transaction.aggregate({
      _sum: { amount: true }
    }),
    prisma.request.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { fullName: true } } }
    })
  ]);

  return {
    totalUsers,
    totalVendors,
    openRequests,
    pendingAiReview,
    activeDeliveries,
    totalGMV: Number(totalGMVResult._sum.amount || 0),
    todayRequests: await prisma.request.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } }
    }),
    recentRequests
  };
}
