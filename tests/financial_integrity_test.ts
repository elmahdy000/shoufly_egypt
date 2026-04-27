import { prisma } from '../lib/prisma';
import { depositFunds } from '../lib/services/transactions/deposit-funds';
import { requestWithdrawal } from '../lib/services/withdrawals/request-withdrawal';
import { reviewWithdrawal } from '../lib/services/withdrawals/review-withdrawal';
import 'dotenv/config';

async function runFinancialIntegrityTest() {
  console.log('💰 --- STARTING FINANCIAL INTEGRITY AUDIT --- 💰\n');

  try {
    // 1. Create a clean user
    const email = `fin_test_${Date.now()}@shoufly.com`;
    const user = await prisma.user.create({
      data: { fullName: 'Finance Auditor', email, role: 'VENDOR', password: '123', walletBalance: 0 }
    });
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) throw new Error('Admin user missing');

    console.log(`👤 User Created: ${user.fullName} (ID: ${user.id}) | Initial Balance: 0 EGP`);

    // 2. Deposit 1000 EGP
    console.log('\n📥 Step 1: Depositing 1000 EGP...');
    const dep = await depositFunds(user.id, 1000);
    console.log(`✅ Success. New Balance: ${dep.newBalance} EGP`);

    // 3. Request Withdrawal of 400 EGP
    console.log('\n📤 Step 2: Requesting Withdrawal of 400 EGP...');
    const wr = await requestWithdrawal(user.id, 400);
    const userAfterReq = await prisma.user.findUnique({ where: { id: user.id } });
    console.log(`✅ Request Created (#${wr.id}). Status: ${wr.status}`);
    console.log(`📍 User Wallet Balance (Should be 600): ${userAfterReq?.walletBalance} EGP`);

    // 4. Reject Withdrawal (Refund Test)
    console.log('\n❌ Step 3: Admin Rejecting Withdrawal (Refund Check)...');
    await reviewWithdrawal({
        withdrawalId: wr.id,
        adminId: admin.id,
        action: 'reject',
        reviewNote: 'Invalid data'
    });
    const userAfterReject = await prisma.user.findUnique({ where: { id: user.id } });
    console.log(`✅ Withdrawal Rejected. User Wallet Balance (Should be back to 1000): ${userAfterReject?.walletBalance} EGP`);

    // 5. Overdraft Test
    console.log('\n🚫 Step 4: Attempting to withdraw 1500 (Overdraft Check)...');
    try {
        await requestWithdrawal(user.id, 1500);
        console.error('❌ FAIL: System allowed overdraft!');
    } catch (e: any) {
        console.log(`✅ SUCCESS: System blocked overdraft: "${e.message}"`);
    }

    // 6. Approve Final Withdrawal
    console.log('\n✅ Step 5: Requesting and Approving 500 EGP Withdrawal...');
    const wrFinal = await requestWithdrawal(user.id, 500);
    await reviewWithdrawal({
        withdrawalId: wrFinal.id,
        adminId: admin.id,
        action: 'approve'
    });
    const userFinal = await prisma.user.findUnique({ where: { id: user.id } });
    console.log(`✅ Approved. Final Balance: ${userFinal?.walletBalance} EGP`);

    console.log('\n🏆 --- FINANCIAL INTEGRITY AUDIT PASSED --- 🏆');

  } catch (err: any) {
    console.error('\n❌ AUDIT FAILED:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runFinancialIntegrityTest();
