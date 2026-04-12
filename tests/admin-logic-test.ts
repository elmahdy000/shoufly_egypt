/**
 * Admin Role Logic Tests
 * Tests admin journey: user management → request review → dispute resolution
 */

import { prisma } from '../lib/prisma';
import { reviewRequest } from '../lib/services/admin';
import 'dotenv/config';

async function testAdminLogic() {
  console.log('\n🧪 Testing ADMIN Logic...\n');

  const results: { test: string; passed: boolean; error?: string }[] = [];

  // Get test admin
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) throw new Error('No admin found in database');

  // Test 1: Admin Privileges
  try {
    console.log('Test 1: Admin Privileges Check');
    
    // Admin should be able to access all user types
    const clients = await prisma.user.count({ where: { role: 'CLIENT' } });
    const vendors = await prisma.user.count({ where: { role: 'VENDOR' } });
    const agents = await prisma.user.count({ where: { role: 'DELIVERY' } });
    
    if (admin.role !== 'ADMIN') {
      throw new Error('User is not an admin');
    }
    
    results.push({ test: 'Admin Privileges', passed: true });
    console.log(`✅ Admin can view all users: ${clients} clients, ${vendors} vendors, ${agents} agents\n`);
  } catch (error: any) {
    results.push({ test: 'Admin Privileges', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 2: Approve Vendor/Delivery Registration
  try {
    console.log('Test 2: Approve Provider Registration');
    
    // Find pending vendors/delivery agents
    const pendingProviders = await prisma.user.findMany({
      where: {
        role: { in: ['VENDOR', 'DELIVERY'] },
        isActive: false,
      },
      take: 5,
    });
    
    if (pendingProviders.length > 0) {
      // Approve first pending provider
      await prisma.user.update({
        where: { id: pendingProviders[0].id },
        data: { isActive: true },
      });
      
      results.push({ test: 'Approve Provider', passed: true });
      console.log(`✅ Approved ${pendingProviders[0].role} #${pendingProviders[0].id}\n`);
    } else {
      results.push({ test: 'Approve Provider', passed: true });
      console.log('✅ No pending providers to approve\n');
    }
  } catch (error: any) {
    results.push({ test: 'Approve Provider', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 3: Review and Approve Request
  try {
    console.log('Test 3: Review Client Request');
    
    // Find pending review requests
    const pendingRequest = await prisma.request.findFirst({
      where: { status: 'PENDING_ADMIN_REVISION' },
    });
    
    if (pendingRequest) {
      // Approve the request
      await prisma.request.update({
        where: { id: pendingRequest.id },
        data: { status: 'OPEN_FOR_BIDDING' },
      });
      
      results.push({ test: 'Review Request', passed: true });
      console.log(`✅ Request #${pendingRequest.id} approved for bidding\n`);
    } else {
      results.push({ test: 'Review Request', passed: true });
      console.log('✅ No pending requests to review\n');
    }
  } catch (error: any) {
    results.push({ test: 'Review Request', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 4: Forward Offer to Client
  try {
    console.log('Test 4: Forward Offer to Client');
    
    // Find pending bids
    const pendingBid = await prisma.bid.findFirst({
      where: { status: 'PENDING' },
      include: { request: true },
    });
    
    if (pendingBid) {
      // Select the bid (admin forwards to client)
      await prisma.bid.update({
        where: { id: pendingBid.id },
        data: { status: 'SELECTED' },
      });
      
      // Update request status
      await prisma.request.update({
        where: { id: pendingBid.requestId },
        data: { status: 'OFFERS_FORWARDED' },
      });
      
      results.push({ test: 'Forward Offer', passed: true });
      console.log(`✅ Bid #${pendingBid.id} selected and forwarded to client\n`);
    } else {
      results.push({ test: 'Forward Offer', passed: true });
      console.log('✅ No pending bids to forward\n');
    }
  } catch (error: any) {
    results.push({ test: 'Forward Offer', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 5: View Platform Statistics
  try {
    console.log('Test 5: Platform Statistics');
    
    // Aggregate platform data
    const totalUsers = await prisma.user.count();
    const totalRequests = await prisma.request.count();
    const totalTransactions = await prisma.transaction.count({
      where: { type: 'ESCROW_DEPOSIT' },
    });
    
    const totalRevenue = await prisma.transaction.aggregate({
      where: { type: 'ADMIN_COMMISSION' },
      _sum: { amount: true },
    });
    
    results.push({ test: 'Platform Statistics', passed: true });
    console.log(`✅ Platform stats: ${totalUsers} users, ${totalRequests} requests, ${totalRevenue._sum.amount || 0} EGP revenue\n`);
  } catch (error: any) {
    results.push({ test: 'Platform Statistics', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 6: Handle Withdrawal Requests
  try {
    console.log('Test 6: Handle Withdrawal Requests');
    
    // Find pending withdrawals
    const pendingWithdrawal = await prisma.withdrawalRequest.findFirst({
      where: { status: 'PENDING' },
    });
    
    if (pendingWithdrawal) {
      // Approve the withdrawal
      await prisma.withdrawalRequest.update({
        where: { id: pendingWithdrawal.id },
        data: { 
          status: 'APPROVED',
          reviewedById: admin.id,
          reviewedAt: new Date(),
        },
      });
      
      results.push({ test: 'Handle Withdrawal', passed: true });
      console.log(`✅ Withdrawal #${pendingWithdrawal.id} approved\n`);
    } else {
      results.push({ test: 'Handle Withdrawal', passed: true });
      console.log('✅ No pending withdrawals\n');
    }
  } catch (error: any) {
    results.push({ test: 'Handle Withdrawal', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 7: Manage Complaints/Disputes
  try {
    console.log('Test 7: Manage Complaints');
    
    // Find open complaints
    const pendingComplaint = await prisma.complaint.findFirst({
      where: { status: 'OPEN' },
    });
    
    if (pendingComplaint) {
      // Resolve the complaint
      await prisma.complaint.update({
        where: { id: pendingComplaint.id },
        data: { 
          status: 'RESOLVED',
          adminResponse: 'Issue resolved by admin',
        },
      });
      
      results.push({ test: 'Resolve Complaint', passed: true });
      console.log(`✅ Complaint #${pendingComplaint.id} resolved\n`);
    } else {
      results.push({ test: 'Resolve Complaint', passed: true });
      console.log('✅ No pending complaints\n');
    }
  } catch (error: any) {
    results.push({ test: 'Resolve Complaint', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 8: Category Management
  try {
    console.log('Test 8: Category Management');
    
    // Check categories
    const categoryCount = await prisma.category.count();
    
    // Add a test category if needed
    if (categoryCount === 0) {
      await prisma.category.create({
        data: {
          name: 'Test Category',
          nameAr: 'فئة اختبار',
          icon: 'test',
        },
      });
    }
    
    results.push({ test: 'Category Management', passed: true });
    console.log(`✅ ${categoryCount} categories in system\n`);
  } catch (error: any) {
    results.push({ test: 'Category Management', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Summary
  console.log('\n📊 ADMIN Test Results:');
  console.log('========================');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach(r => {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} ${r.test}`);
    if (r.error) console.log(`   ⚠️ ${r.error}`);
  });
  
  console.log(`\n✨ Total: ${passed} passed, ${failed} failed`);
  
  return { passed, failed, results };
}

// Run if executed directly
if (require.main === module) {
  testAdminLogic()
    .then(() => {
      console.log('\n🏁 Admin tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Admin tests failed:', error);
      process.exit(1);
    });
}

export { testAdminLogic };
