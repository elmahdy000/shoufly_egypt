
import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests/create-request';
import { createBid } from '../lib/services/bids/create-bid';
import { acceptOffer } from '../lib/services/offers/accept-offer';
import { acceptDeliveryTask } from '../lib/services/delivery/accept-delivery-task';
import { requestWithdrawal } from '../lib/services/withdrawals/request-withdrawal';
import { resolveDispute } from '../lib/services/admin/resolve-dispute';

async function runChaosTest() {
  console.log('🚀 INITIALIZING CHAOS TEST SUITE (Stress/Security/Finance) 🚀\n');

  // --- PREPARE DATA ---
  const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const vendors = await prisma.user.findMany({ where: { role: 'VENDOR' }, take: 3 });
  const agents = await prisma.user.findMany({ where: { role: 'DELIVERY' }, take: 3 });
  const category = await prisma.category.findFirst({ where: { parentId: { not: null } } });

  if (!client || !admin || vendors.length < 2 || agents.length < 2 || !category) {
    console.error('❌ Prep Failed: Chaos test needs 1 Client, 1 Admin, 2 Vendors, 2 Delivery Agents and 1 Sub-category.');
    return;
  }

  // -------------------------------------------------------------------
  // SCENARIO 1: CONCURRENCY RACE
  // -------------------------------------------------------------------
  console.log('🔥 [SCENARIO 1] RACE CONDITION: Multiple agents grabbing one delivery...');
  
  const req1 = await createRequest(client.id, {
    title: 'Race Condition Test Order',
    description: 'Stress test for delivery assignment',
    categoryId: category.id,
    address: 'Cairo Street 10',
    latitude: 30.0444,
    longitude: 31.2357,
    deliveryPhone: '01012345678'
  });

  await prisma.request.update({
    where: { id: req1!.id },
    data: { status: 'ORDER_PAID_PENDING_DELIVERY' }
  });

  const raceResults = await Promise.allSettled([
    acceptDeliveryTask(req1!.id, agents[0].id),
    acceptDeliveryTask(req1!.id, agents[1].id),
    acceptDeliveryTask(req1!.id, agents[2].id)
  ]);

  const successes = raceResults.filter(r => r.status === 'fulfilled').length;
  if (successes === 1) {
    console.log('   ✅ PASS: Isolation works. Only ONE agent captured the task.');
  } else {
    console.error(`   ❌ FAIL: Concurrency violation! ${successes} agents captured the task.`);
  }

  // -------------------------------------------------------------------
  // SCENARIO 2: UNAUTHORIZED HIJACK
  // -------------------------------------------------------------------
  console.log('\n🔒 [SCENARIO 2] SECURITY: Unauthorized Hijack attempt...');
  
  const attacker = await prisma.user.findFirst({ where: { role: 'CLIENT', id: { not: client.id } } });

  if (attacker) {
    const req2 = await createRequest(client.id, {
        title: 'Victim Order',
        description: 'Sensitive data',
        categoryId: category.id,
        address: 'Secret Location',
        latitude: 30, longitude: 31, deliveryPhone: '111'
    });
    
    try {
        await acceptOffer(999, attacker.id); 
        console.error('   ❌ FAIL: Attacker was able to call acceptOffer for request they do not own!');
    } catch (e: any) {
        console.log(`   ✅ PASS: Hijack blocked. Error: ${e.message}`);
    }
  } else {
    console.log('   ⚠️ SKIPPING Hijack test (need two clients in DB).');
  }

  // -------------------------------------------------------------------
  // SCENARIO 3: WALLET DEPLETION & OVER-DRAW
  // -------------------------------------------------------------------
  console.log('\n💰 [SCENARIO 3] FINANCE: Double-Draft & Insufficient Balance...');
  
  const vendor = vendors[0];
  await prisma.user.update({ where: { id: vendor.id }, data: { walletBalance: 100 } });
  
  const withdrawalResults = await Promise.allSettled([
    requestWithdrawal(vendor.id, 60),
    requestWithdrawal(vendor.id, 60)
  ]);

  const withdrawalSuccesses = withdrawalResults.filter(r => r.status === 'fulfilled').length;
  if (withdrawalSuccesses === 1) {
    console.log('   ✅ PASS: Race condition blocked. Vendor only withdrew 60.');
  } else {
    console.error(`   ❌ FAIL: Over-draw possible! Successes: ${withdrawalSuccesses}`);
  }

  // -------------------------------------------------------------------
  // SCENARIO 4: DISPUTE ARBITRATION
  // -------------------------------------------------------------------
  console.log('\n⚖️ [SCENARIO 4] WORKFLOW: Admin Penalty & Dispute Resolution...');

  const req4 = await createRequest(client.id, {
    title: 'Broken TV Repair',
    description: 'Needs dispute',
    categoryId: category.id,
    address: 'Cairo', latitude: 30, longitude: 31, deliveryPhone: '123'
  });

  await prisma.request.update({
    where: { id: req4!.id },
    data: { status: 'OPEN_FOR_BIDDING' }
  });

  const bid4 = await createBid(vendors[1].id, {
    requestId: req4!.id,
    description: 'Bad service vendor',
    netPrice: 200
  });

  await prisma.bid.update({
    where: { id: bid4.id },
    data: { status: 'ACCEPTED_BY_CLIENT' }
  });

  await prisma.request.update({
    where: { id: req4!.id },
    data: { 
        status: 'ORDER_PAID_PENDING_DELIVERY',
        selectedBidId: bid4.id 
    }
  });

  await prisma.transaction.create({
    data: {
        userId: client.id,
        requestId: req4!.id,
        amount: 230,
        type: 'ESCROW_DEPOSIT'
    }
  });

  const disputeResult = await resolveDispute(admin.id, req4!.id, 30);
  
  if (Number(disputeResult.clientRefunded) === 140 && Number(disputeResult.vendorCompensated) === 60) {
    console.log('   ✅ PASS: Dispute math is PERFECT (EGP 140 to Client, 60 to Vendor).');
  } else {
    console.error(`   ❌ FAIL: Math mismatch. Client: ${disputeResult.clientRefunded}, Vendor: ${disputeResult.vendorCompensated}`);
  }

  console.log('\n✨ ALL CHAOS TEST SCENARIOS COMPLETED ✨');
}

runChaosTest().catch(console.error);
