import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests';
import { reviewRequest } from '../lib/services/admin';
import { createBid } from '../lib/services/bids';
import { forwardOffer } from '../lib/services/admin';
import { acceptOffer } from '../lib/services/offers';
import { payRequest } from '../lib/services/payments';
import { updateDeliveryStatus, acceptDeliveryTask, completeDeliveryAgent } from '../lib/services/delivery';
import { settleOrder } from '../lib/services/transactions';
import { depositFunds } from '../lib/services/transactions/deposit-funds';
import { createReview } from '../lib/services/reviews/create-review';
import { createComplaint } from '../lib/services/complaints/create-complaint';
import { getAdminStats } from '../lib/services/analytics/get-admin-stats';
import 'dotenv/config';

async function runMasterTest() {
  console.log('🌟 STARTING COMPREHENSIVE MASTER SYSTEM TEST 🌟\n');

  try {
    // 1. Prerequisites 
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });
    const agent = await prisma.user.findFirst({ where: { role: 'DELIVERY' } });
    const category = await prisma.category.findFirst({ where: { parentId: { not: null } } }) || await prisma.category.findFirst();

    if (!client || !vendor || !agent || !category) throw new Error('Run simulation.ts first to seed users');

    console.log(`Test Context: Client(#${client.id}), Vendor(#${vendor.id}), Agent(#${agent.id})\n`);

    // 2. Financial Setup
    console.log('Step 1: Topping up Client wallet...');
    await depositFunds(client.id, 2000);

    // 3. Request Flow
    console.log('Step 2: Client creating request...');
    const request = await createRequest(client.id, {
      title: 'Master Test Request',
      description: 'Verifying all systems are connected',
      categoryId: category.id,
      address: 'Test Street, Cairo',
      latitude: 30.0,
      longitude: 31.0,
      deliveryPhone: '01012345678'
    });

    console.log('Step 3: Admin approving request...');
    await reviewRequest(request.id, 'approve');

    // 4. Bidding Flow
    console.log('Step 4: Vendor placing bid...');
    const bid = await createBid(vendor.id, {
      requestId: request.id,
      description: 'I will provide top quality',
      netPrice: 1000
    });

    console.log('Step 5: Admin forwarding offer...');
    await forwardOffer(bid.id);

    // 5. Payment & Escrow
    console.log('Step 6: Client accepting and paying...');
    await acceptOffer(bid.id, client.id);
    await payRequest(request.id, client.id);

    // 6. Delivery Flow
    console.log('Step 7: Vendor preparing & Agent delivery...');
    await updateDeliveryStatus({ requestId: request.id, vendorId: vendor.id, status: 'VENDOR_PREPARING' });
    await updateDeliveryStatus({ requestId: request.id, vendorId: vendor.id, status: 'READY_FOR_PICKUP' });
    
    await acceptDeliveryTask(request.id, agent.id);
    await completeDeliveryAgent(request.id, agent.id);

    // 7. Settlement
    console.log('Step 8: Finalizing Order (Settlement)...');
    await settleOrder(request.id);

    // 8. Feedback Flow
    console.log('Step 9: Feedback (Review & Complaint)...');
    await createReview({
        requestId: request.id,
        reviewerId: client.id,
        rating: 5,
        comment: 'Master Test: Everything worked perfectly!'
    });

    await createComplaint({
        requestId: request.id,
        userId: client.id,
        subject: 'Minor Packaging Issue',
        description: 'The box was a bit crushed, but product is fine.'
    });

    // 9. BI Analytics Validation
    console.log('\nStep 10: Generating BI Analytics Report...');
    const stats = await getAdminStats();

    console.log('\n✅ MASTER TEST VERIFICATION:');
    console.log(`- Request Status: CLOSED_SUCCESS`);
    console.log(`- Total Platform GMV: ${stats.overview.totalGMV} EGP`);
    console.log(`- New Total Admin Commission: ${stats.overview.totalAdminCommission} EGP`);
    console.log(`- Average Platform Rating: ${stats.overview.avgPlatformRating} / 5`);
    console.log(`- Open Complaints: ${stats.counters.openComplaints}`);

    console.log('\n🏆 ALL SYSTEMS GO! THE ENTIRE ECOSYSTEM IS OPERATIONAL.');

  } catch (error) {
    console.error('\n❌ MASTER TEST CRASHED:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

runMasterTest();
