import { prisma } from '../lib/prisma';
import { createBid } from '../lib/services/bids/create-bid';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function runConcurrencyAudit() {
  console.log('⚔️  Starting High-Concurrency Bidding Race...\n');

  try {
    const pass = await bcrypt.hash('pass123', 10);
    const timestamp = Date.now();

    // 1. Setup Vendors
    console.log('👥 Creating 20 concurrent vendors...');
    const vendorIds = await Promise.all(
      Array.from({ length: 20 }).map(async (_, i) => {
        const email = `con-vendor-${i}-${timestamp}@test.com`;
        const v = await prisma.user.create({
          data: { fullName: `Vendor ${i}`, email, password: pass, role: 'VENDOR', isActive: true }
        });
        return v.id;
      })
    );

    // 2. Setup Request
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const category = await prisma.category.findFirst({ where: { parentId: { not: null } } });

    if (!client || !category) throw new Error('Client or Category missing for test');

    const req = await prisma.request.create({
      data: {
        title: 'Concurrency Test Request',
        description: 'May the fastest bid win',
        clientId: client.id,
        categoryId: category.id,
        address: 'Test City',
        latitude: 30,
        longitude: 31,
        deliveryPhone: '010',
        status: 'OPEN_FOR_BIDDING'
      }
    });

    console.log(`📦 Created Request #${req.id}. Launching 20 simultaneous bids...`);

    // 3. THE RACE
    const startTime = Date.now();
    const results = await Promise.allSettled(
      vendorIds.map(vId => 
        createBid(vId, {
          requestId: req.id,
          description: 'Top quality work!',
          netPrice: Math.floor(Math.random() * 1000) + 100
        })
      )
    );
    const endTime = Date.now();

    // 4. Results Analysis
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    console.log(`\n📊 Race Finished in ${endTime - startTime}ms`);
    console.log(`   ✅ Successful Bids: ${successCount}`);
    console.log(`   ❌ Failed Bids: ${failureCount}`);

    // Verify status update (should be BIDS_RECEIVED)
    const updatedReq = await prisma.request.findUnique({ where: { id: req.id } });
    console.log(`   📝 Final Request Status: ${updatedReq?.status}`);

    // Verify bid count in DB
    const bidCount = await prisma.bid.count({ where: { requestId: req.id } });
    console.log(`   🔢 Bids in Database: ${bidCount}`);

    if (bidCount === successCount) {
        console.log('\n✅ Transaction Integrity Confirmed: All successful bids are saved.');
    } else {
        console.error('\n❌ Integrity Violation: Mismatch between successes and DB records!');
    }

    // 5. Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.bid.deleteMany({ where: { requestId: req.id } });
    await prisma.request.delete({ where: { id: req.id } });
    await prisma.user.deleteMany({ where: { id: { in: vendorIds } } });
    console.log('✨ Concurrency Audit complete.');

  } catch (err) {
    console.error('💥 Concurrency Audit Crashed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runConcurrencyAudit();
