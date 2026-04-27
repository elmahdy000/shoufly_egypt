import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests';
import { reviewRequest } from '../lib/services/admin';
import { createBid } from '../lib/services/bids';
import { forwardOffer } from '../lib/services/admin';
import { acceptOffer } from '../lib/services/offers';
import { payRequest } from '../lib/services/payments';
import { updateDeliveryStatus, acceptDeliveryTask, completeDeliveryAgent } from '../lib/services/delivery';
import { settleOrder } from '../lib/services/transactions';
import 'dotenv/config';

async function runFullFlow() {
  console.log('🔄 STARTING COMPREHENSIVE END-TO-END TEST 🔄\n');

  try {
    // Basic setup
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const vendors = await prisma.user.findMany({ where: { role: 'VENDOR' }, take: 3 });
    const agent = await prisma.user.findFirst({ where: { role: 'DELIVERY' } });
    const category = await prisma.category.findFirst({ where: { parentId: { not: null } } }) || await prisma.category.findFirst();

    if (!client || vendors.length < 3 || !agent || !category) {
        throw new Error(`Basic entities missing. Found: ${client?'Client':'No Client'}, ${vendors.length} Vendors, ${agent?'Agent':'No Agent'}, ${category?'Category':'No Category'}`);
    }

    console.log(`[1/9] 🆕 Creating Request...`);
    const request = await createRequest(client.id, {
        title: 'E2E Full Flow Test',
        description: 'Testing with multiple bids to satisfy business competition rules.',
        categoryId: category.id,
        address: 'Zamalek, Cairo',
        latitude: 30.06, longitude: 31.22, deliveryPhone: '01012345678'
    });
    console.log(`      ID: #${request.id}`);

    console.log(`\n[2/9] 🛡️ Admin Reviewing...`);
    await reviewRequest(request.id, 'approve');
    console.log(`      Status Updated: OPEN_FOR_BIDDING`);

    console.log(`\n[3/9] 💰 Vendors Submitting 3 Bids...`);
    const bidIds: number[] = [];
    for (const v of vendors) {
        const bid = await createBid(v.id, {
            requestId: request.id,
            description: `Bid from ${v.fullName}`,
            netPrice: 150 + Math.random() * 100
        });
        bidIds.push(bid.id);
        console.log(`      Bid #${bid.id} from ${v.fullName} submitted.`);
    }

    console.log('\n[4/9] 📢 Admin Forwarding All Offers...');
    for (const bidId of bidIds) {
        await forwardOffer(bidId);
        console.log(`      Offer #${bidId} forwarded.`);
    }

    console.log('\n[5/9] 💳 Client Accepting & Paying (Selecting Bid #1)...');
    // Ensure client has balance
    await prisma.user.update({ where: { id: client.id }, data: { walletBalance: 1000 } });
    
    await acceptOffer(bidIds[0], client.id);
    await payRequest(request.id, client.id);
    console.log(`      Payment Success | Status: ORDER_PAID_PENDING_DELIVERY`);

    console.log('\n[6/9] 🍳 Vendor Preparation...');
    const selectedVendorId = vendors[0].id;
    await updateDeliveryStatus({ requestId: request.id, userId: selectedVendorId, status: 'VENDOR_PREPARING' });
    await updateDeliveryStatus({ requestId: request.id, userId: selectedVendorId, status: 'READY_FOR_PICKUP' });
    console.log(`      Status: READY_FOR_PICKUP`);

    console.log(`\n[7/9] 🚚 Delivery Pickup...`);
    await acceptDeliveryTask(request.id, agent.id);
    console.log(`      Agent (#${agent.id}) picked up the order`);

    console.log(`\n[8/9] 📍 Delivery Completion (QR)...`);
    const dbReq = await prisma.request.findUnique({ where: { id: request.id }, select: { qrCode: true } });
    await completeDeliveryAgent(request.id, agent.id, dbReq!.qrCode!);
    console.log(`      Arrived at Destination | QR Scanned`);

    console.log(`\n[9/9] 🏁 Final Settlement...`);
    const finalResult = await settleOrder(request.id);
    console.log(`      SUCCESS! | Final Status: ${finalResult.finalRequestStatus}`);
    console.log(`      Payout to Vendor: ${finalResult.vendorPayout} EGP`);

    console.log('\n✨ COMPREHENSIVE E2E TEST PASSED! ✨');

  } catch (error: any) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runFullFlow();
