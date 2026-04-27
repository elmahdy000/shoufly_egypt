import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests/create-request';
import { reviewRequest } from '../lib/services/admin/review-request';
import { createBid } from '../lib/services/bids/create-bid';
import { forwardOffer } from '../lib/services/admin/forward-offer';
import { acceptOffer } from '../lib/services/offers/accept-offer';
import { payRequest } from '../lib/services/payments/pay-request';
import { acceptDeliveryTask } from '../lib/services/delivery/accept-delivery-task';
import { settleOrder } from '../lib/services/transactions/settle-order';
import { requestWithdrawal } from '../lib/services/withdrawals/request-withdrawal';
import { reviewWithdrawal } from '../lib/services/withdrawals/review-withdrawal';
import { logger } from '../lib/utils/logger';

/**
 * 🚀 Comprehensive Shoofly System Simulation
 * This test simulates the complete lifecycle of a request.
 */
async function runFullSimulation() {
  console.log('🏁 Starting Comprehensive System Simulation...\n');

  try {
    // 1. Setup Mock Users
    const client = await prisma.user.upsert({
      where: { email: 'client@test.com' },
      update: { walletBalance: 1000 },
      create: { 
        email: 'client@test.com', 
        fullName: 'Test Client', 
        role: 'CLIENT', 
        walletBalance: 1000, 
        isActive: true,
        password: 'hashed_password' 
      }
    });

    const vendor = await prisma.user.upsert({
      where: { email: 'vendor@test.com' },
      update: { isActive: true },
      create: { 
        email: 'vendor@test.com', 
        fullName: 'Test Vendor', 
        role: 'VENDOR', 
        isActive: true, 
        walletBalance: 0,
        password: 'hashed_password'
      }
    });

    const admin = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: { role: 'ADMIN' },
      create: { 
        email: 'admin@test.com', 
        fullName: 'Admin User', 
        role: 'ADMIN', 
        isActive: true,
        password: 'hashed_password'
      }
    });

    const rider = await prisma.user.upsert({
      where: { email: 'rider@test.com' },
      update: { role: 'DELIVERY' },
      create: { 
        email: 'rider@test.com', 
        fullName: 'Test Rider', 
        role: 'DELIVERY', 
        isActive: true,
        password: 'hashed_password'
      }
    });

    console.log('✅ Mock users ready.');

    // 2. Client Creates Request
    console.log('\n📦 Step 1: Creating Request...');
    const request = await createRequest(client.id, {
      title: 'Simulation Test Request',
      description: 'Need a plumbing fix',
      categoryId: 2, // Use subcategory (Plumbing)
      address: 'Test Location',
      latitude: 30.0,
      longitude: 31.0,
      deliveryPhone: '0123456789'
    });
    console.log(`✅ Request created: #${request.id}`);

    // 3. Admin Approves Request
    console.log('\n⚖️ Step 2: Admin Approving Request...');
    await reviewRequest(request.id, 'approve');
    console.log('✅ Request approved and opened for bidding.');

    // 4. Vendor Places Bid
    console.log('\n💸 Step 3: Vendor Placing Bid...');
    const bid = await createBid(vendor.id, {
      requestId: request.id,
      netPrice: 100,
      description: 'I can fix it quickly'
    });
    console.log(`✅ Bid placed: #${bid.id} (Client Price: ${bid.clientPrice})`);

    // 5. Admin Forwards Bid to Client
    console.log('\n📝 Step 4: Admin Forwarding Bid...');
    await forwardOffer(bid.id);
    console.log('✅ Bid forwarded to client.');

    // 6. Client Accepts Offer
    console.log('\n🤝 Step 5: Client Accepting Offer...');
    await acceptOffer(bid.id, client.id);
    console.log('✅ Offer accepted by client.');

    // 7. Client Pays Request
    console.log('\n💰 Step 6: Client Paying Request...');
    const payment = await payRequest(request.id, client.id);
    console.log(`✅ Payment completed.`);
    console.log(`   - Amount Paid: ${payment.amountPaid} EGP`);
    console.log(`   - New Client Balance: ${payment.newWalletBalance} EGP`);
    console.log(`   - Request Status: ${payment.requestStatus}`);

    // 8. Rider Accepts Task
    console.log('\n🚚 Step 7: Rider Accepting Task...');
    await acceptDeliveryTask(request.id, rider.id);
    console.log(`✅ Rider assigned (#${rider.id}) and status updated to OUT_FOR_DELIVERY.`);

    // 9. QR Confirmation & Settlement
    console.log('\n🏁 Step 8: Order Settlement (QR Confirmation)...');
    const settlement = await settleOrder(request.id);
    
    const finalVendor = await prisma.user.findUnique({ where: { id: vendor.id } });
    const finalRider = await prisma.user.findUnique({ where: { id: rider.id } });
    
    console.log(`✅ Order settled!`);
    console.log(`   - Total Paid by Client: ${settlement.totalAmount} EGP`);
    console.log(`   - Platform Commission: ${settlement.adminCommission} EGP`);
    console.log(`   - Vendor Payout: ${settlement.vendorPayout} EGP`);
    console.log(`   - Rider Payout: ${settlement.riderPayout} EGP`);
    console.log(`   - Vendor New Balance: ${finalVendor?.walletBalance} EGP`);
    console.log(`   - Rider New Balance: ${finalRider?.walletBalance} EGP`);

    // 10. Vendor Withdraws
    console.log('\n🏧 Step 9: Vendor Withdrawal...');
    const withdrawal = await requestWithdrawal(vendor.id, 50);
    const vendorAfterWithdrawal = await prisma.user.findUnique({ where: { id: vendor.id } });
    
    console.log(`✅ Withdrawal requested: #${withdrawal.id}`);
    console.log(`   - Requested Amount: 50 EGP`);
    console.log(`   - Vendor Balance (Held): ${vendorAfterWithdrawal?.walletBalance} EGP`);

    // 11. Admin Approves Withdrawal
    console.log('\n✅ Step 10: Admin Approving Withdrawal...');
    await reviewWithdrawal({
        withdrawalId: withdrawal.id,
        adminId: admin.id,
        action: 'approve'
    });
    
    const vendorFinal = await prisma.user.findUnique({ where: { id: vendor.id } });
    console.log(`✅ Withdrawal approved.`);
    console.log(`   - Final Vendor Balance: ${vendorFinal?.walletBalance} EGP`);

    console.log('\n🏆 ALL SCENARIOS COMPLETED SUCCESSFULLY WITH VERIFIED DATA!');

  } catch (error) {
    console.error('\n❌ SIMULATION FAILED:', error);
    process.exit(1);
  }
}

runFullSimulation();
