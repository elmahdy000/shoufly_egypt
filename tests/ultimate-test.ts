import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests';
import { createBid } from '../lib/services/bids';
import { reviewRequest } from '../lib/services/admin';
import { payRequest } from '../lib/services/payments';
import { acceptDeliveryTask, completeDeliveryAgent } from '../lib/services/delivery';
import { settleOrder } from '../lib/services/transactions';
import { sendMessage } from '../lib/services/chat/send-message';
import { forwardOffer } from '../lib/services/admin/forward-offer';
import { acceptOffer } from '../lib/services/offers/accept-offer';
import 'dotenv/config';


async function runUltimateTest() {
  console.log('🚀 INITIALIZING ULTIMATE SYSTEM TEST...\n');

  try {
    // 1. Setup Users
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });
    const agent = await prisma.user.findFirst({ where: { role: 'DELIVERY' } });
    const category = await prisma.category.findFirst({ where: { parentId: { not: null } } }) || await prisma.category.findFirst();

    if (!admin || !client || !vendor || !agent || !category) {
      throw new Error('Base data missing. Run simulation.ts and seed-categories.ts first.');
    }

    // 2. Client Side: Create Request with Images
    console.log('Step 1: Client creating request with images...');
    const request = await createRequest(client.id, {
      title: 'Ultimate Test Order',
      description: 'Full cycle testing with chat and images',
      categoryId: category.id,
      address: 'Main St 101',
      latitude: 30.1,
      longitude: 31.2,
      deliveryPhone: '0123456789',
      images: [{ filePath: '/test/img.png', fileName: 'test.png', mimeType: 'image/png', fileSize: 100 }]
    });

    if(!request) throw new Error('Request creation failed');

    // 3. Admin Side: Review & Chat
    console.log('Step 2: Admin reviewing and chatting...');
    await reviewRequest(request.id, 'approve');
    await sendMessage({ senderId: admin.id, receiverId: client.id, content: 'Hello Client, your request is live!', requestId: request.id });

    // 4. Vendor Side: Bid
    console.log('Step 3: Vendor bidding...');
    const bid = await createBid(vendor.id, {
      requestId: request.id,
      description: 'I can fix this perfectly',
      netPrice: 400
    });

    // 5. Admin Side: Forward Bid to Client
    console.log('Step 4: Admin forwarding bid...');
    await forwardOffer(bid.id);

    // 6. Client Side: Accept Bid and Pay
    console.log('Step 5: Client accepting and paying...');
    await prisma.user.update({ where: { id: client.id }, data: { walletBalance: 1000 } }); 
    await acceptOffer(bid.id, client.id);
    await payRequest(request.id, client.id); 
    
    // 7. Vendor Preparation
    console.log('Step 6: Vendor marking order as preparing...');
    const { updateDeliveryStatus } = await import('../lib/services/delivery/update-delivery-status');

    await updateDeliveryStatus({ vendorId: vendor.id, requestId: request.id, status: 'VENDOR_PREPARING' });
    console.log('Step 7: Vendor marking order as ready...');
    await updateDeliveryStatus({ vendorId: vendor.id, requestId: request.id, status: 'READY_FOR_PICKUP' });



    // 8. Delivery Flow
    console.log('Step 8: Delivery flow...');
    await acceptDeliveryTask(request.id, agent.id);
    await completeDeliveryAgent(request.id, agent.id);


    // 8. Settlement
    console.log('Step 7: Final Settlement...');
    const result = await settleOrder(request.id);

    // 9. Verification
    console.log('\n✅ VERIFICATION RESULTS:');
    console.log(`- Request STATUS: ${result.finalRequestStatus}`);

    console.log(`- Vendor Payout: ${result.vendorPayout} EGP`);
    console.log(`- Admin Commission: ${result.adminCommission} EGP`);
    
    const chats = await prisma.chatMessage.count({ where: { requestId: request.id } });
    console.log(`- Chat Messages Exchanged: ${chats}`);

    console.log('\n🏆 ALL SYSTEMS OPERATIONAL - TEST PASSED!');

  } catch (error) {
    console.error('\n❌ ULTIMATE TEST FAILED:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

runUltimateTest();
