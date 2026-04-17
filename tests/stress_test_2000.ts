import { prisma } from '../lib/prisma';

async function runHeavyStressTest() {
  const TOTAL_REQUESTS = 2000;
  console.log(`🚀 --- STARTING HEAVY STRESS TEST: ${TOTAL_REQUESTS} Requests --- 🚀\n`);

  try {
    const startTime = Date.now();

    // 1. Setup Participants
    console.log('👥 [1/3] Creating 50 high-load clients and vendors...');
    const clientIds: number[] = [];
    const vendorIds: number[] = [];
    
    for (let i = 0; i < 50; i++) {
        const c = await prisma.user.create({
            data: { fullName: `Stress Client ${i}`, email: `stress_c_${i}_${Date.now()}@test.com`, role: 'CLIENT', password: '123' }
        });
        const v = await prisma.user.create({
            data: { fullName: `Stress Vendor ${i}`, email: `stress_v_${i}_${Date.now()}@test.com`, role: 'VENDOR', password: '123' }
        });
        clientIds.push(c.id);
        vendorIds.push(v.id);
    }
    const cat = await prisma.category.findFirst({ where: { parentId: { not: null } } });
    console.log(`✅ Participants created in ${Date.now() - startTime}ms`);

    // 2. Mass Request Creation (Batching)
    console.log(`\n📝 [2/3] Creating ${TOTAL_REQUESTS} Requests...`);
    const reqStartTime = Date.now();
    const requestsData = Array.from({ length: TOTAL_REQUESTS }).map((_, i) => ({
        clientId: clientIds[i % 50],
        categoryId: cat!.id,
        title: `Stress Request ${i}`,
        description: 'Automatic load test request',
        address: 'Cairo Stress Zone',
        latitude: 30, longitude: 31,
        deliveryPhone: '010',
        status: 'OPEN_FOR_BIDDING' as any
    }));

    // Use createMany for maximum speed
    const created = await prisma.request.createMany({ data: requestsData });
    const reqDuration = Date.now() - reqStartTime;
    console.log(`✅ Successfully created ${created.count} requests in ${reqDuration}ms`);
    console.log(`📊 Average creation speed: ${(reqDuration / TOTAL_REQUESTS).toFixed(2)}ms per request`);

    // 3. Mass Bidding (One bid per request)
    console.log(`\n📢 [3/3] Simulating ${TOTAL_REQUESTS} Bids from multiple vendors...`);
    const bidStartTime = Date.now();
    
    // Fetch IDs of created requests to link bids
    const allReqs = await prisma.request.findMany({
        where: { title: { startsWith: 'Stress Request' } },
        select: { id: true }
    });

    const bidsData = allReqs.map((req: any, i: number) => ({
        requestId: req.id,
        vendorId: vendorIds[i % 50],
        netPrice: 100 + (i % 10),
        clientPrice: 115 + (i % 10),
        description: 'Bulk stress bid',
        status: 'PENDING' as any
    }));

    const bidsCreated = await prisma.bid.createMany({ data: bidsData });
    const bidDuration = Date.now() - bidStartTime;
    console.log(`✅ Successfully created ${bidsCreated.count} bids in ${bidDuration}ms`);
    console.log(`📊 Average bidding speed: ${(bidDuration / TOTAL_REQUESTS).toFixed(2)}ms per bid`);

    const totalTime = Date.now() - startTime;
    console.log(`\n🏆 --- STRESS TEST COMPLETE --- 🏆`);
    console.log(`⏱️ Total Execution Time: ${(totalTime / 1000).toFixed(2)} seconds`);
    console.log(`⚡ Throughput: ${((TOTAL_REQUESTS * 2) / (totalTime / 1000)).toFixed(1)} database operations per second.`);

  } catch (err: any) {
    console.error('❌ STRESS TEST FAILED:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runHeavyStressTest();
