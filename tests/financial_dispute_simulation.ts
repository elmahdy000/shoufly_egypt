import { prisma } from '../lib/prisma';
import { payRequest } from '../lib/services/payments';
import { createRefund } from '../lib/services/refunds';
import { requestWithdrawal, reviewWithdrawal } from '../lib/services/withdrawals';
import { depositFunds } from '../lib/services/transactions/deposit-funds';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function runDisputeSimulation() {
  console.log('💰 Starting Financial Dispute & Recovery Simulation...\n');

  try {
    const pass = await bcrypt.hash('pass123', 10);
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });
    const subCat = await prisma.category.findFirst({ where: { parentId: { not: null } } });

    if (!admin || !client || !vendor || !subCat) throw new Error('Base data missing. Run master_simulation first.');

    // --- SCENARIO 1: REFUND FLOW ---
    console.log('--- Scenario 1: Escrow Refund Flow ---');
    
    // Create a new request and bid for this scenario
    const req = await prisma.request.create({
      data: {
        title: 'Disputed Order',
        description: 'Quality issue',
        clientId: client.id,
        categoryId: subCat.id,
        address: 'Cairo',
        latitude: 0, longitude: 0,
        deliveryPhone: '010',
        status: 'OPEN_FOR_BIDDING'
      }
    });

    const bid = await prisma.bid.create({
      data: {
        requestId: req.id,
        vendorId: vendor.id,
        description: 'Good Service',
        netPrice: 1000,
        clientPrice: 1150, // 15% commission
        status: 'ACCEPTED_BY_CLIENT'
      }
    });

    await prisma.request.update({ where: { id: req.id }, data: { selectedBidId: bid.id } });

    // Step 1: Client Pays
    await depositFunds(client.id, 1200);
    const balanceBefore = await prisma.user.findUnique({ where: { id: client.id }, select: { walletBalance: true } });
    console.log(`✅ Client wallet balance before payment: ${balanceBefore?.walletBalance}`);
    
    await payRequest(req.id, client.id);
    const balanceAfterPay = await prisma.user.findUnique({ where: { id: client.id }, select: { walletBalance: true } });
    console.log(`✅ Client paid 1150 EGP. New balance: ${balanceAfterPay?.walletBalance}`);

    // Step 2: Admin Issues Refund
    console.log('⚠️ Admin is issuing a REFUND for this disputed request...');
    const refundResult = await createRefund({ requestId: req.id, adminId: admin.id, reason: 'Defective item reported' });
    
    console.log(`✅ Refund Success! TX ID: ${refundResult.refundTransactionId}`);
    console.log(`✅ Client wallet updated. New balance: ${refundResult.newClientWalletBalance}`);
    
    const finalRequest = await prisma.request.findUnique({ where: { id: req.id } });
    console.log(`✅ Final Request Status: ${finalRequest?.status} (Expected: CLOSED_CANCELLED)`);


    // --- SCENARIO 2: REJECTED WITHDRAWAL FLOW ---
    console.log('\n--- Scenario 2: Rejected Withdrawal Recovery ---');
    
    // Set vendor balance
    await prisma.user.update({ where: { id: vendor.id }, data: { walletBalance: 500 } });
    console.log(`✅ Vendor starting balance: 500 EGP`);

    // Step 1: Request Withdrawal
    const withdrawal = await requestWithdrawal(vendor.id, 300);
    const balanceHeld = await prisma.user.findUnique({ where: { id: vendor.id }, select: { walletBalance: true } });
    console.log(`✅ Vendor requested 300 EGP. Balance HELD: ${balanceHeld?.walletBalance} (Expected: 200)`);

    // Step 2: Admin Rejects Withdrawal
    console.log('⚠️ Admin is REJECTING the withdrawal request...');
    await reviewWithdrawal({ withdrawalId: withdrawal.id, adminId: admin.id, action: 'reject', reviewNote: 'Bank details incorrect' });
    
    const finalVendorBalance = await prisma.user.findUnique({ where: { id: vendor.id }, select: { walletBalance: true } });
    console.log(`✅ Withdrawal REJECTED. Balance RETURNED: ${finalVendorBalance?.walletBalance} (Expected: 500)`);

    console.log('\n🚀 FINANCIAL RECOVERY SIMULATION COMPLETED SUCCESSFULLY!');
    
  } catch (err) {
    console.error('❌ Dispute Simulation Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runDisputeSimulation();
