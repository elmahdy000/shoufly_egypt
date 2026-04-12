import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests';
import 'dotenv/config';

async function testCategoryEnforcement() {
  console.log('🧪 TESTING CATEGORY ENFORCEMENT LOGIC...\n');

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    if (!client) throw new Error('Run simulation.ts first');

    // 1. Create a Parent Category and a Sub-Category
    const parent = await prisma.category.upsert({
      where: { slug: 'pro-electronics' },
      update: {},
      create: { name: 'Pro Electronics', slug: 'pro-electronics' }
    });

    const sub = await prisma.category.upsert({
      where: { slug: 'smartphones' },
      update: {},
      create: { name: 'Smartphones', slug: 'smartphones', parentId: parent.id }
    });

    console.log(`Setup: Parent(${parent.name}), Sub(${sub.name})\n`);

    // 2. Attempt to create request with PARENT category (Should FAIL)
    console.log('Test 1: Attempting request with Parent Category...');
    try {
      await createRequest(client.id, {
        title: 'Broken Laptop',
        description: '...',
        categoryId: parent.id,
        address: '...', latitude: 0, longitude: 0, deliveryPhone: '...'
      });
      console.error('❌ FAIL: System allowed parent category!');
    } catch (e: any) {
      console.log(`✅ SUCCESS: Blocked parent category: "${e.message}"`);
    }

    // 3. Attempt to create request with SUB category (Should PASS)
    console.log('\nTest 2: Attempting request with Sub-Category...');
    const req = await createRequest(client.id, {
        title: 'Broken iPhone',
        description: 'Screen fix',
        categoryId: sub.id,
        address: '...', latitude: 0, longitude: 0, deliveryPhone: '...'
    });
    console.log(`✅ SUCCESS: Request #${req?.id} created with sub-category "${sub.name}"`);

  } catch (error) {
     console.error('💥 Test Crashed:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testCategoryEnforcement();
