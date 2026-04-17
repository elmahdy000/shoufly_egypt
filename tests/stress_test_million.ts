import { prisma } from '../lib/prisma';

async function runMillionStressTest() {
  const TOTAL_GOAL = 1000000;
  const CHUNK_SIZE = 10000;
  console.log(`🌌 --- STARTING "THE MILLION" STRESS TEST: ${TOTAL_GOAL.toLocaleString()} Requests --- 🌌\n`);

  try {
    const mainStartTime = Date.now();

    // 1. SETUP Participants once
    const client = await prisma.user.create({
        data: { fullName: 'Million Client', email: `million_c_${Date.now()}@test.com`, role: 'CLIENT', password: '123' }
    });
    const cat = await prisma.category.findFirst({ where: { parentId: { not: null } } });

    let createdSoFar = 0;
    
    console.log(`🚀 Processing in chunks of ${CHUNK_SIZE.toLocaleString()}...`);

    while (createdSoFar < TOTAL_GOAL) {
        const batchStartTime = Date.now();
        const batchData = Array.from({ length: CHUNK_SIZE }).map((_, i) => ({
            clientId: client.id,
            categoryId: cat!.id,
            title: `Million Req #${createdSoFar + i}`,
            description: 'Extreme load test',
            address: 'Digital Desert',
            latitude: 0, longitude: 0,
            deliveryPhone: '000',
            status: 'OPEN_FOR_BIDDING' as any
        }));

        await prisma.request.createMany({ data: batchData });
        
        createdSoFar += CHUNK_SIZE;
        
        if (createdSoFar % 100000 === 0) {
            const lapTime = (Date.now() - mainStartTime) / 1000;
            console.log(`📈 Progress: ${createdSoFar.toLocaleString()} / ${TOTAL_GOAL.toLocaleString()} (${((createdSoFar/TOTAL_GOAL)*100).toFixed(0)}%) | Time: ${lapTime.toFixed(1)}s`);
        }
    }

    const totalTimeSeconds = (Date.now() - mainStartTime) / 1000;
    console.log(`\n👑 --- THE MILLION TEST COMPLETED --- 👑`);
    console.log(`⏱️ Total Time: ${totalTimeSeconds.toFixed(2)} seconds`);
    console.log(`📊 Final Throughput: ${(TOTAL_GOAL / totalTimeSeconds).toFixed(1)} requests per second.`);
    console.log(`✅ System handled 1,000,000 rows without crashing.`);

  } catch (err: any) {
    console.error('❌ MILLION TEST FAILED:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runMillionStressTest();
