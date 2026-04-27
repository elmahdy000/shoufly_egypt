import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests/create-request';
import 'dotenv/config';

async function runLoadAudit() {
  console.log('🚀 Starting Extreme Load Audit (50 Concurrent Requests)...\n');

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const category = await prisma.category.findFirst({ where: { parentId: { not: null } } });
    const location = await prisma.city.findFirst({ include: { governorate: true } });

    if (!client || !category || !location) throw new Error('Test environment incomplete');

    const LOAD_SIZE = 50;
    console.log(`📡 Dispatching ${LOAD_SIZE} requests simultaneously...`);

    const startTime = Date.now();
    
    const results = await Promise.allSettled(
      Array.from({ length: LOAD_SIZE }).map((_, i) => 
        createRequest(client.id, {
          title: `Load Test Request ${i}`,
          description: 'Testing system throughput under extreme conditions',
          categoryId: category.id,
          address: 'Cairo, Egypt',
          latitude: 30.0444,
          longitude: 31.2357,
          deliveryPhone: '01012345678',
          governorateId: location.governorateId,
          cityId: location.id
        })
      )
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    console.log(`\n📊 Performance Results:`);
    console.log(`   ⏱️ Total Duration: ${duration}ms`);
    console.log(`   ⚡ Throughput: ${(LOAD_SIZE / (duration / 1000)).toFixed(2)} req/sec`);
    console.log(`   ✅ Successes: ${successCount}`);
    console.log(`   ❌ Failures: ${failureCount}`);

    if (failureCount > 0) {
        console.log('\n⚠️ Failures detected:');
        results.forEach((r, i) => {
            if (r.status === 'rejected') {
                console.log(`   - Req ${i}: ${r.reason.message}`);
            }
        });
    }

    // Verify DB
    const countInDb = await prisma.request.count({
        where: { title: { startsWith: 'Load Test Request' } }
    });
    console.log(`\n🔢 Total Load Test Requests in DB: ${countInDb}`);

    // Cleanup
    console.log('\n🧹 Cleaning up load test data...');
    await prisma.request.deleteMany({
        where: { title: { startsWith: 'Load Test Request' } }
    });
    console.log('✨ Load Audit complete.');

  } catch (err) {
    console.error('💥 Load Audit Crashed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runLoadAudit();
