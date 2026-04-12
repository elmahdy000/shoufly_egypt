import { getAdminStats } from '../lib/services/analytics/get-admin-stats';
import { prisma } from '../lib/prisma';
import 'dotenv/config';

async function testAnalytics() {
  console.log('📊 GENERATING BI ANALYTICS REPORT...\n');

  try {
    const stats = await getAdminStats();

    console.log('--- Platform Overview ---');
    console.log(`💰 Total Revenue (Commission): ${stats.overview.totalAdminCommission} EGP`);
    console.log(`📈 Gross Merchandise Value (GMV): ${stats.overview.totalGMV} EGP`);
    console.log(`🎯 Order Fulfillment Rate: ${stats.overview.fulfillmentRate}%`);
    console.log(`⭐️ Average Platform Rating: ${stats.overview.avgPlatformRating} / 5`);

    console.log('\n--- Real-time Counters ---');
    console.log(`👥 Total Users: ${stats.counters.totalUsers}`);
    console.log(`📦 Pending Admin Revisions: ${stats.counters.pendingRequests}`);
    console.log(`🚨 Open Complaints: ${stats.counters.openComplaints}`);

    console.log('\n--- 7-Day Performance Trends ---');
    stats.trends.forEach(day => {
        console.log(`[${day.day}]: Requests: ${day.requests}, Revenue: ${day.revenue} EGP`);
    });

    console.log('\n--- Popular Categories ---');
    stats.topCategories.forEach(cat => {
        console.log(`- ${cat.name}: ${cat.requestCount} requests`);
    });

    console.log('\n🏆 ANALYTICS DATA GENERATED SUCCESSFULLY!');

  } catch (error) {
    console.error('❌ ANALYTICS TEST FAILED:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testAnalytics();
