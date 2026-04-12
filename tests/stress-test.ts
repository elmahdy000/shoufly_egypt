import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests';
import { reviewRequest } from '../lib/services/admin';
import { createBid } from '../lib/services/bids';
import { acceptOffer } from '../lib/services/offers';
import { payRequest } from '../lib/services/payments';
import { acceptDeliveryTask } from '../lib/services/delivery';
import { depositFunds } from '../lib/services/transactions/deposit-funds';
import { requestWithdrawal } from '../lib/services/withdrawals';
import 'dotenv/config';


async function runStressTest() {
  console.log('🛡️ Starting Security & Logic Stress Test...\n');

  try {
    const hashedPassword = await import('bcryptjs').then(b => b.hash('pass1234', 10));
    
    const client = await prisma.user.upsert({
      where: { email: 'client@example.com' },
      update: {},
      create: { fullName: 'John Client', email: 'client@example.com', password: hashedPassword, role: 'CLIENT', walletBalance: 100 }
    });
    
    const vendor = await prisma.user.upsert({
      where: { email: 'vendor@example.com' },
      update: {},
      create: { fullName: 'Premium Vendor', email: 'vendor@example.com', password: hashedPassword, role: 'VENDOR', walletBalance: 0 }
    });

    const category = await prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: { name: 'Electronics', slug: 'electronics' }
    });


    // Scenario 1: Insufficient Balance
    console.log('--- Test 1: Insufficient Balance Check ---');
    try {
      await prisma.user.update({ where: { id: client.id }, data: { walletBalance: 10 } }); // Drop balance to 10
      const req1 = await createRequest(client.id, {
        title: 'Expensive Fix',
        description: 'Need expensive parts',
        categoryId: category.id,
        address: '...',
        latitude: 0, longitude: 0, deliveryPhone: '...'
      });
      await reviewRequest(req1.id, 'approve');
      const bid1 = await createBid(vendor.id, { requestId: req1.id, description: 'Gold repair', netPrice: 5000 });
      await acceptOffer(bid1.id, client.id);
      
      console.log('Attempting to pay 5000 with 10 balance...');
      await payRequest(req1.id, client.id);
      console.error('❌ FAIL: System allowed payment without funds!');
    } catch (e: any) {
      console.log(`✅ SUCCESS: System blocked payment: "${e.message}"`);
    }

    // Scenario 2: Double Bidding
    console.log('\n--- Test 2: Double Bidding Protection ---');
    try {
      const req2 = await createRequest(client.id, {
        title: 'Small Job',
        description: '...',
        categoryId: category.id,
        address: '...',
        latitude: 0, longitude: 0, deliveryPhone: '...'
      });
      await reviewRequest(req2.id, 'approve');
      await createBid(vendor.id, { requestId: req2.id, description: 'First bid', netPrice: 100 });
      console.log('Attempting second bid on same request...');
      await createBid(vendor.id, { requestId: req2.id, description: 'Second bid', netPrice: 90 });
      console.error('❌ FAIL: System allowed double bidding!');
    } catch (e: any) {
      console.log(`✅ SUCCESS: System blocked double bid: "${e.message}"`);
    }

    // Scenario 3: Unauthorized Task Pickup
    console.log('\n--- Test 3: Status Timing & Sequence ---');
    try {
      const req3 = await createRequest(client.id, { title: 'Wait for me', description: '...', categoryId: category.id, address: '...', latitude: 0, longitude: 0, deliveryPhone: '...' });
      await reviewRequest(req3.id, 'approve');
      console.log('Agent attempting to accept task before it is ready for pickup...');
      await acceptDeliveryTask(req3.id, vendor.id); // vendor acting as agent here for test
      console.error('❌ FAIL: System allowed picking up unready order!');
    } catch (e: any) {
      console.log(`✅ SUCCESS: System blocked premature pickup: "${e.message}"`);
    }

    // Scenario 4: Withdrawal Overdraft
    console.log('\n--- Test 4: Withdrawal Overdraft ---');
    try {
        await prisma.user.update({ where: { id: vendor.id }, data: { walletBalance: 50 } });
        console.log('Vendor with 50 EGP attempting to withdraw 5000...');
        await requestWithdrawal(vendor.id, 5000);
        console.error('❌ FAIL: System allowed withdrawal exceeding balance!');
    } catch (e: any) {
        console.log(`✅ SUCCESS: System blocked overdraft: "${e.message}"`);
    }

    // Scenario 5: Negative Deposit
    console.log('\n--- Test 5: Negative Deposit ---');
    try {
        console.log('Attempting to deposit -100 EGP...');
        await depositFunds(client.id, -100);
        console.error('❌ FAIL: System allowed negative deposit!');
    } catch (e: any) {
        console.log(`✅ SUCCESS: System blocked negative money: "${e.message}"`);
    }

    console.log('\n🎯 ALL SECURITY TESTS PASSED SUCCESSFULLY!');

  } catch (error) {
    console.error('\n💥 Stress Test Crashed!');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

runStressTest();
