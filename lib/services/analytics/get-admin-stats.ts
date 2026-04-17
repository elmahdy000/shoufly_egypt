import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';
import Decimal from 'decimal.js';

export async function getAdminStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // 1. Financial Metrics
  // Calculate gross commission
  const totalFinancials = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { type: 'ADMIN_COMMISSION' }
  });
  
  // Calculate total refunds to subtract
  const totalRefunds = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { type: 'REFUND' }
  });
  
  // Precise math with Decimal
  const grossCommission = new Decimal(totalFinancials._sum.amount?.toString() || '0');
  const refundsAmount = new Decimal(totalRefunds._sum.amount?.toString() || '0');
  const netCommission = Decimal.max(0, grossCommission.minus(refundsAmount));

  const gmv = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { type: 'ESCROW_DEPOSIT' }
  });

  // 2. Order Metrics
  const totalRequests = await prisma.request.count();
  const completedRequests = await prisma.request.count({ where: { status: 'CLOSED_SUCCESS' } });
  const pendingRequests = await prisma.request.count({ where: { status: 'PENDING_ADMIN_REVISION' } });
  
  const fulfillmentRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

  // 3. User Growth
  const totalUsers = await prisma.user.count();
  const vendorsCount = await prisma.user.count({ where: { role: 'VENDOR' } });
  const clientsCount = await prisma.user.count({ where: { role: 'CLIENT' } });

  // 4. Quality & Support
  const avgRating = await prisma.review.aggregate({
    _avg: { rating: true }
  });

  const openComplaints = await prisma.complaint.count({ where: { status: 'OPEN' } });

  // 5. Daily Activity (Today)
  const todayRequests = await prisma.request.count({
    where: { createdAt: { gte: todayStart, lte: todayEnd } }
  });
  
  const todayRevenue = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { 
          type: 'ADMIN_COMMISSION',
          createdAt: { gte: todayStart, lte: todayEnd }
      }
  });
  
  const todayRefunds = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { 
          type: 'REFUND',
          createdAt: { gte: todayStart, lte: todayEnd }
      }
  });

  // 6. Top Categories
  const topCategories = await prisma.category.findMany({
      include: {
          _count: { select: { requests: true } }
      },
      orderBy: {
          requests: { _count: 'desc' }
      },
      take: 5
  });

  // 7. Trends (Last 7 Days) - OPTIMIZED: Fetch in bulk and aggregate in memory
  const last7DaysStart = startOfDay(subMonths(now, 0)); // Simplified: actually we want last 7 days from now
  const weekStart = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));

  const [allWeekRequests, allWeekTransactions] = await Promise.all([
      prisma.request.findMany({
          where: { createdAt: { gte: weekStart } },
          select: { createdAt: true }
      }),
      prisma.transaction.findMany({
          where: { 
              createdAt: { gte: weekStart },
              type: { in: ['ADMIN_COMMISSION', 'REFUND'] }
          },
          select: { createdAt: true, type: true, amount: true }
      })
  ]);

  const trends = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const dStart = startOfDay(d);
      const dEnd = endOfDay(d);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayRequests = allWeekRequests.filter(r => r.createdAt >= dStart && r.createdAt <= dEnd).length;
      
      const dayCommissions = allWeekTransactions
          .filter(t => t.type === 'ADMIN_COMMISSION' && t.createdAt >= dStart && t.createdAt <= dEnd)
          .reduce((sum, t) => sum.plus(t.amount.toString()), new Decimal(0));
          
      const dayRefunds = allWeekTransactions
          .filter(t => t.type === 'REFUND' && t.createdAt >= dStart && t.createdAt <= dEnd)
          .reduce((sum, t) => sum.plus(t.amount.toString()), new Decimal(0));

      const netRevenue = Decimal.max(0, dayCommissions.minus(dayRefunds));

      return {
          day: label,
          requests: dayRequests,
          revenue: netRevenue.toNumber()
      };
  });

  return {
    overview: {
      totalAdminCommission: netCommission.toNumber(),
      grossCommission: grossCommission.toNumber(),
      totalRefunds: refundsAmount.toNumber(),
      totalGMV: Number(gmv._sum.amount || 0),
      fulfillmentRate: Number(fulfillmentRate.toFixed(2)),
      avgPlatformRating: Number(avgRating._avg.rating?.toFixed(1) || 0),
    },
    counters: {
      totalRequests,
      pendingRequests,
      openComplaints,
      totalUsers,
      vendorsCount,
      clientsCount
    },
    today: {
      requests: todayRequests,
      commission: Math.max(0, Number(todayRevenue._sum.amount || 0) - Number(todayRefunds._sum.amount || 0)),
      refunds: Number(todayRefunds._sum.amount || 0)
    },
    topCategories: topCategories.map(c => ({
        name: c.name,
        requestCount: c._count.requests
    })),
    trends
  };
}
