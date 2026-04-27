import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { withCache } from "@/lib/cache";

export async function getPlatformStats() {
  return withCache('admin:stats:global', async () => {
    const [
      totalUsers,
      totalVendors,
      openRequests,
      pendingAiReview,
      activeDeliveries,
      totalGMVResult,
      recentRequests,
      pendingWithdrawals,
      totalAdmins,
      onlineAdminKeys,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'VENDOR' } }),
      prisma.request.count({ where: { status: 'OPEN_FOR_BIDDING' } }),
      prisma.request.count({ where: { status: 'PENDING_ADMIN_REVISION' } }),
      prisma.request.count({ where: { status: 'ORDER_PAID_PENDING_DELIVERY' } }),
      prisma.transaction.aggregate({ _sum: { amount: true } }),
      prisma.request.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { fullName: true } } }
      }),
      prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      redis.keys('presence:admin:*').catch(() => [])
    ]);

    const todayRequests = await prisma.request.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } }
    });

    return {
      totalUsers,
      totalVendors,
      openRequests,
      pendingAiReview,
      activeDeliveries,
      pendingWithdrawals,
      totalAdmins,
      onlineAdmins: onlineAdminKeys.length || 1,
      totalGMV: Number(totalGMVResult._sum.amount || 0),
      todayRequests,
      recentRequests
    };
  }, 300);
}
