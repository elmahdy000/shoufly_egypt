import { prisma } from '../lib/prisma';
import { depositFunds } from '../lib/services/transactions/deposit-funds';
import { createRequest } from '../lib/services/requests/create-request';
import { createBid } from '../lib/services/bids/create-bid';
import { acceptOffer } from '../lib/services/offers/accept-offer';
import { acceptDeliveryTask } from '../lib/services/delivery/accept-delivery-task';
import { updateDeliveryStatus } from '../lib/services/delivery/update-delivery-status';
import { completeDeliveryAgent } from '../lib/services/delivery/complete-delivery-agent';
import { settleOrder } from '../lib/services/transactions/settle-order';
import { requestWithdrawal } from '../lib/services/withdrawals/request-withdrawal';
import { confirmDelivery } from '../lib/services/qr/confirm-delivery';

async function runUltimateSimulation() {
  console.log('\n🌟 --- STARTING ULTIMATE SHOOFLY LIFECYCLE SIMULATION --- 🌟\n');

  try {
    // 0. SETUP CATEGORY
    console.log('📂 [0/9] Setting up Test Categories...');
    const parentCat = await prisma.category.upsert({
      where: { slug: 'test-parent' },
      update: {},
      create: { name: 'Test-Parent', slug: 'test-parent' }
    });
    const subCat = await prisma.category.upsert({
      where: { slug: 'test-sub' },
      update: {},
      create: { name: 'Test-Sub', slug: 'test-sub', parentId: parentCat.id }
    });

    // 1. SETUP USERS (Simulated Registration)
    console.log('👤 [1/9] Creating Participants...');
    const client = await prisma.user.create({
      data: { fullName: 'U-Client', email: `u_client_${Date.now()}@test.com`, role: 'CLIENT', walletBalance: 0, isActive: true, password: 'password123' }
    });
    const vendor = await prisma.user.create({
      data: { fullName: 'U-Vendor', email: `u_vendor_${Date.now()}@test.com`, role: 'VENDOR', walletBalance: 0, isActive: true, password: 'password123' }
    });
    const agent = await prisma.user.create({
      data: { fullName: 'U-Agent', email: `u_agent_${Date.now()}@test.com`, role: 'DELIVERY', walletBalance: 0, isActive: true, password: 'password123' }
    });
    console.log(`✅ Participants Ready.`);

    // 2. DEPOSIT FUNDS
    console.log('\n💳 [2/9] Client Depositing 2500 EGP...');
    const deposit = await depositFunds(client.id, 2500);
    console.log(`✅ Balance: ${deposit.newBalance} EGP`);

    // 3. CREATE REQUEST
    console.log('\n📝 [3/9] Client creating a Request...');
    const request = await createRequest(client.id, {
      title: 'Simulation Order #999',
      description: 'End-to-End System Stress Test',
      categoryId: subCat.id,
      address: 'Simulated HQ, Cairo',
      latitude: 30.0444,
      longitude: 31.2357,
      deliveryPhone: '0100000000'
    });
    console.log(`✅ Request ID: ${request.id}`);

    // 🏆 ADMIN APPROVAL STEP (Simulation)
    console.log('\n👑 [3.5/9] Admin approving the request...');
    await prisma.request.update({
      where: { id: request.id },
      data: { status: 'OPEN_FOR_BIDDING' }
    });
    console.log('✅ Request is now OPEN_FOR_BIDDING');

    // 4. VENDOR BIDDING
    console.log('\n📢 [4/9] Vendor placing a Bid...');
    const bid = await createBid(vendor.id, {
      requestId: request.id,
      description: 'Certified Best Price',
      netPrice: 1200
    });
    console.log(`✅ Bid Placed (ID: ${bid.id}). Net Price: 1200 EGP`);

    // 🎩 ADMIN SELECTION STEP (Simulation)
    console.log('\n🎩 [4.5/9] Admin selecting and forwarding the bid...');
    await prisma.bid.update({
        where: { id: bid.id },
        data: { status: 'SELECTED' }
    });
    await prisma.request.update({
        where: { id: request.id },
        data: { status: 'OFFERS_FORWARDED' }
    });
    console.log('✅ Bid SELECTED and Request status set to OFFERS_FORWARDED');

    // 5. CLIENT SELECTION & ESCROW
    console.log('\n🤝 [5/9] Client accepting the Offer (Escrow Lock)...');
    const acceptedOrder = await acceptOffer(bid.id, client.id);
    await prisma.request.update({
        where: { id: request.id },
        data: { status: 'ORDER_PAID_PENDING_DELIVERY' }
    });
    const lockedClient = await prisma.user.findUnique({ where: { id: client.id } });
    console.log(`✅ Offer Accepted. Order Created (ID: ${acceptedOrder.id})`);
    console.log(`💰 Financials: Client Wallet is now ${lockedClient?.walletBalance} (Funds held in Escrow)`);

    // 6. DELIVERY FLOW PREPARATION (Vendor)
    console.log('\n🔄 [5.5/9] Vendor preparing order...');
    await updateDeliveryStatus({ requestId: request.id, userId: vendor.id, status: 'VENDOR_PREPARING' });
    await updateDeliveryStatus({ requestId: request.id, userId: vendor.id, status: 'READY_FOR_PICKUP' });

    // 6. DELIVERY ASSIGNMENT
    console.log('\n🚚 [6/9] Delivery Agent accepting the task...');
    await acceptDeliveryTask(request.id, agent.id);
    console.log(`✅ Agent Assigned.`);

    // 7. DELIVERY COMPLETION (Agent)
    console.log('\n🔄 [7/9] Delivery Agent marking order as DELIVERED...');
    await completeDeliveryAgent(request.id, agent.id);
    console.log('📍 Current Status: DELIVERED (Awaiting Client Confirmation)');

    // 8. FINAL CONFIRMATION & SETTLEMENT (Client)
    console.log('\n🏁 [8/9] Client confirming delivery and triggering settlement...');
    const result = await confirmDelivery({ requestId: request.id, clientId: client.id });
    console.log(`✅ SETTLEMENT COMPLETE. Order is now fully processed.`);

    // 9. WITHDRAWAL
    console.log('\n🏦 [9/9] Vendor withdrawing profits...');
    const withdrawal = await requestWithdrawal(vendor.id, 500);
    console.log(`✅ Withdrawal Request ID: ${withdrawal.id}`);

    console.log('\n🏆 --- ULTIMATE LIFECYCLE SIMULATION COMPLETED SUCCESSFULLY --- 🏆\n');

  } catch (err: any) {
    console.error('\n❌ CRITICAL SIMULATION ERROR!');
    console.error(err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runUltimateSimulation();
