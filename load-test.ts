import { prisma } from './lib/prisma';
import { createRequest } from './lib/services/requests';
import 'dotenv/config';

async function runLoadTest() {
  console.log('⚡ Starting High Volume Load Test...\n');
  
  const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
  const category = await prisma.category.findFirst({ where: { parentId: { not: null } } });
  const gov = await prisma.governorate.findFirst();
  const city = await prisma.city.findFirst({ where: { governorateId: gov?.id } });
  
  if (!client || !category || !gov || !city) {
    console.error('❌ Please run simulation.ts first to setup base data.');
    return;
  }

  const volume = 1000;
  console.log(`Generating ${volume} requests for Client #${client.id}...`);

  const startTime = Date.now();
  
  // Use Promise.all for concurrent insertion to stress the connection pool
  const chunks = [];
  const chunkSize = 20;

  
  for (let i = 0; i < volume; i += chunkSize) {
    const chunk = Array.from({ length: Math.min(chunkSize, volume - i) }).map((_, idx) => 
      createRequest(client.id, {
        title: `Load Test Request ${i + idx}`,
        description: 'Performance testing high volume data insertion',
        categoryId: category.id,
        address: 'Test Address',
        latitude: 0,
        longitude: 0,
        deliveryPhone: '0000000000',
        governorateId: gov.id,
        cityId: city.id
      })
    );
    // Await each chunk sequentially to prevent exhausting the DB connection pool
    await Promise.all(chunk);
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n✅ Finished generating ${volume} requests in ${duration}s.`);
  console.log(`Average speed: ${(volume / duration).toFixed(2)} req/sec`);

  // Verify pagination performance
  console.log('\n--- Verifying Pagination Performance ---');
  const pStart = Date.now();
  const paginatedResults = await prisma.request.findMany({
    where: { clientId: client.id },
    skip: 900,
    take: 20,
    orderBy: { createdAt: 'desc' }
  });
  const pDuration = Date.now() - pStart;
  console.log(`✅ Fetched page 46 (skip 900) in ${pDuration}ms. (Thanks to indexes!)`);

}

runLoadTest();
