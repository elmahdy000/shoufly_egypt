import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';

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
  
  // Net commission = Gross - Refunds
  const grossCommission = Number(totalFinancials._sum.amount || 0);
  const refundsAmount = Number(totalRefunds._sum.amount || 0);
  const netCommission = Math.max(0, grossCommission - refundsAmount);

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

  // 7. Trends (Last 7 Days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
          start: startOfDay(d),
          end: endOfDay(d),
          label: d.toLocaleDateString('en-US', { weekday: 'short' })
      };
  }).reverse();

  const trends = await Promise.all(last7Days.map(async (day) => {
      const count = await prisma.request.count({
          where: { createdAt: { gte: day.start, lte: day.end } }
      });
      const revenue = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { 
              type: 'ADMIN_COMMISSION',
              createdAt: { gte: day.start, lte: day.end }
          }
      });
      
      const dayRefunds = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { 
              type: 'REFUND',
              createdAt: { gte: day.start, lte: day.end }
          }
      });
      
      const netRevenue = Math.max(0, Number(revenue._sum.amount || 0) - Number(dayRefunds._sum.amount || 0));
      
      return {
          day: day.label,
          requests: count,
          revenue: netRevenue
      };
  }));

  return {
    overview: {
      totalAdminCommission: netCommission,
      grossCommission: grossCommission,
      totalRefunds: refundsAmount,
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
