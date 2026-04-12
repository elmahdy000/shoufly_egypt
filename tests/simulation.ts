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
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function runSimulation() {
  console.log('🚀 Starting Full Workflow Simulation...\n');


  try {
    // 1. Setup Users
    console.log('--- Step 1: Setting up Users ---');
    const hashedPassword = await bcrypt.hash('pass1234', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@shoofly.com' },
      update: {},
      create: { fullName: 'System Admin', email: 'admin@shoofly.com', password: hashedPassword, role: 'ADMIN' }
    });
    
    const client = await prisma.user.upsert({
      where: { email: 'client@example.com' },
      update: {},
      create: { fullName: 'John Client', email: 'client@example.com', password: hashedPassword, role: 'CLIENT', walletBalance: 0 }
    });

    const vendor = await prisma.user.upsert({
      where: { email: 'vendor@example.com' },
      update: {},
      create: { fullName: 'Premium Vendor', email: 'vendor@example.com', password: hashedPassword, role: 'VENDOR', walletBalance: 0 }
    });

    const agent = await prisma.user.upsert({
      where: { email: 'agent@example.com' },
      update: {},
      create: { fullName: 'Flash Delivery', email: 'agent@example.com', password: hashedPassword, role: 'DELIVERY' }
    });

    const category = await prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: { name: 'Electronics', slug: 'electronics' }
    });

    await prisma.platformSetting.upsert({
      where: { id: 1 },
      update: {},
      create: {
        commissionPercent: 15,
        minVendorMatchCount: 3,
        initialRadiusKm: 5,
        maxRadiusKm: 50,
        radiusExpansionStepKm: 5,
      }
    });


    await prisma.vendorCategory.upsert({
      where: { vendorId_categoryId: { vendorId: vendor.id, categoryId: category.id } },
      update: {},
      create: { vendorId: vendor.id, categoryId: category.id }
    });

    console.log(`✅ Users ready. Client: #${client.id}, Vendor: #${vendor.id}, Admin: #${admin.id}, Agent: #${agent.id}`);

    // Pre-simulation: Deposit funds for client
    console.log('\n--- Step 1.5: Topping up Client Wallet ---');
    await depositFunds(client.id, 1000);
    const updatedClient = await prisma.user.findUnique({ where: { id: client.id } });
    console.log(`✅ Client wallet topped up. New Balance: ${updatedClient?.walletBalance}`);

    // 2. Create Request
    console.log('\n--- Step 2: Creating Request (Client) ---');
    const request = await createRequest(client.id, {
      title: 'Fix my laptop',
      description: 'Screen is flickering',
      categoryId: category.id,
      address: 'Cairo, Egypt',
      latitude: 30.0444,
      longitude: 31.2357,
      deliveryPhone: '0123456789'
    });

    console.log(`✅ Request created: #${request.id} - Status: ${request.status}`);

    // 3. Admin Review
    console.log('\n--- Step 3: Reviewing Request (Admin) ---');
    await reviewRequest(request.id, 'approve');
    console.log(`✅ Request approved. Status: OPEN_FOR_BIDDING`);

    // 4. Vendor Bids
    console.log('\n--- Step 4: Placing Bid (Vendor) ---');
    const bid = await createBid(vendor.id, {
      requestId: request.id,
      description: 'I can fix it for 500 EGP',
      netPrice: 500
    });

    console.log(`✅ Bid placed: #${bid.id} - Net: ${bid.netPrice}, Client Price: ${bid.clientPrice}`);

    // 5. Admin Forwards
    console.log('\n--- Step 5: Forwarding Offer (Admin) ---');
    await forwardOffer(bid.id);

    console.log(`✅ Offer forwarded to client.`);

    // 6. Client Accepts & Pays
    console.log('\n--- Step 6: Accepting & Paying (Client) ---');
    await acceptOffer(bid.id, client.id);
    await payRequest(request.id, client.id);
    console.log(`✅ Request PAID. Status: ORDER_PAID_PENDING_DELIVERY`);

    // 7. Vendor Prepares
    console.log('\n--- Step 7: Preparing Order (Vendor) ---');
    await updateDeliveryStatus({
        requestId: request.id,
        vendorId: vendor.id,
        status: 'VENDOR_PREPARING'
    });
    await updateDeliveryStatus({
        requestId: request.id,
        vendorId: vendor.id,
        status: 'READY_FOR_PICKUP'
    });
    console.log(`✅ Order READY FOR PICKUP.`);

    // 8. Delivery Agent Tasks
    console.log('\n--- Step 8: Delivery In Progress (Agent) ---');
    await acceptDeliveryTask(request.id, agent.id);
    console.log(`✅ Agent picked up. Status: OUT_FOR_DELIVERY`);
    await completeDeliveryAgent(request.id, agent.id);
    console.log(`✅ Agent delivered. Awaiting client QR scan.`);

    // 9. Final Settlement
    console.log('\n--- Step 9: Final Settlement (Client QR Scan) ---');
    const finalResult = await settleOrder(request.id);
    console.log(`\n🏆 SIMULATION SUCCESSFUL!`);
    console.log(`-------------------------`);
    console.log(`Final Status: ${finalResult.finalRequestStatus}`);
    console.log(`Vendor Payout: ${finalResult.vendorPayout} EGP`);
    console.log(`Admin Commission: ${finalResult.adminCommission} EGP`);
    console.log(`-------------------------`);

  } catch (error) {
    console.error('\n❌ Simulation Failed!');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

runSimulation();
