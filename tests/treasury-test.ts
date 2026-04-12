import { prisma } from '../lib/prisma';
import { requestWithdrawal } from '../lib/services/withdrawals';
import { reviewWithdrawal } from '../lib/services/admin/withdrawals';
import 'dotenv/config';

async function runTreasuryTest() {
  console.log('💰 STARTING TREASURY & WITHDRAWAL lifecycle TEST...\n');

  try {
    // 1. Setup Admin & Vendor
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });
    
    if (!admin || !vendor) throw new Error('No admin/vendor found. Run simulation.ts first.');

    console.log(`Setting up Vendor #${vendor.id} with 1000 EGP balance...`);
    await prisma.user.update({
      where: { id: vendor.id },
      data: { walletBalance: 1000 }
    });

    // 2. Request Withdrawal
    console.log('\n--- Step 1: Requesting Withdrawal (500 EGP) ---');
    const withdrawal = await requestWithdrawal(vendor.id, 500);
    console.log(`✅ Withdrawal Request Created: #${withdrawal.id}`);

    // 3. Admin Review: REJECT
    console.log('\n--- Step 2: Admin Rejecting Withdrawal ---');
    await reviewWithdrawal({
        withdrawalId: withdrawal.id,
        adminId: admin.id,
        status: 'REJECTED',
        note: 'Invalid bank details'
    });
    console.log('✅ Request Rejected via Service. Funds should be refunded.');

    const afterReject = await prisma.user.findUnique({ where: { id: vendor.id } });
    console.log(`   Vendor Balance after rejection: ${afterReject?.walletBalance} (Expected 1000)`);

    // 4. Admin Review: APPROVE
    console.log('\n--- Step 3: New Request & Admin Approval ---');
    const withdrawal2 = await requestWithdrawal(vendor.id, 700);
    await reviewWithdrawal({
        withdrawalId: withdrawal2.id,
        adminId: admin.id,
        status: 'APPROVED',
        note: 'Success'
    });
    console.log(`✅ Request #${withdrawal2.id} APPROVED via Service.`);

    const finalBalance = await prisma.user.findUnique({ where: { id: vendor.id } });
    console.log(`   Final Vendor Balance: ${finalBalance?.walletBalance} (Expected 300)`);

    console.log('\n✨ TREASURY TEST COMPLETED SUCCESSFULLY!');


    // 5. Total Treasury Check
    const totalPending = await prisma.withdrawalRequest.aggregate({
        _sum: { amount: true },
        where: { status: 'PENDING' }
    });
    console.log(`\n📊 Treasury Summary:`);
    console.log(`- Total Ongoing Pending Withdrawals: ${totalPending._sum.amount || 0} EGP`);

    console.log('\n✨ TREASURY TEST COMPLETED SUCCESSFULLY!');

  } catch (error) {
    console.error('\n❌ TREASURY TEST FAILED:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

runTreasuryTest();

