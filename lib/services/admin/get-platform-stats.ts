import { prisma } from "@/lib/prisma";

export async function getPlatformStats() {
  const [
    totalUsers,
    activeVendors,
    openRequests,
    totalTransactions,
    pendingWithdrawals,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'VENDOR' } }),
    prisma.request.count({ where: { status: 'OPEN_FOR_BIDDING' } }),
    prisma.transaction.count(),
    prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
  ]);

  // Calculate platform revenue (sum of ADMIN_COMMISSION transactions)
  const revenueResult = await prisma.transaction.aggregate({
    where: { type: 'ADMIN_COMMISSION' },
    _sum: { amount: true },
  });

  // Calculate total liquidity (sum of all user wallet balances)
  const liquidityResult = await prisma.user.aggregate({
    _sum: { walletBalance: true },
  });

  return {
    totalUsers,
    activeVendors,
    openRequests,
    totalTransactions,
    pendingWithdrawals,
    revenue: Number(revenueResult._sum.amount || 0),
    liquidity: Number(liquidityResult._sum.walletBalance || 0),
    growthRate: 12.5, // Mocked for now
  };
}
