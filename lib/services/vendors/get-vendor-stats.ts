import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function getVendorStats(vendorId: number) {
  logger.info('vendor.stats.fetch', { vendorId });

  const [totalBids, selectedBids, successfulSettlements, totalRevenue] = await Promise.all([
    // 1. Total Bids Sent
    prisma.bid.count({ where: { vendorId } }),

    // 2. Bids Selected by Admins/Clients
    prisma.bid.count({ 
      where: { 
        vendorId, 
        status: { in: ['SELECTED', 'ACCEPTED_BY_CLIENT'] } 
      } 
    }),

    // 3. Successfully Closed Requests
    prisma.request.count({
      where: {
        bids: {
          some: {
            vendorId,
            status: 'ACCEPTED_BY_CLIENT'
          }
        },
        status: 'CLOSED_SUCCESS'
      }
    }),

    // 4. Total Revenue (Net Payouts)
    prisma.transaction.aggregate({
      where: {
        userId: vendorId,
        type: 'VENDOR_PAYOUT'
      },
      _sum: { amount: true }
    })
  ]);

  // Calculate Success Rate
  const winRate = totalBids > 0 ? (selectedBids / totalBids) * 100 : 0;
  const completionRate = selectedBids > 0 ? (successfulSettlements / selectedBids) * 100 : 0;

  return {
    overview: {
      totalBids,
      selectedBids,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      successfulSettlements
    },
    metrics: {
      winRate: Math.round(winRate),
      completionRate: Math.round(completionRate)
    }
  };
}
