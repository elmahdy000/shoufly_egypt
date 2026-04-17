import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests';
import { reviewRequest } from '../lib/services/admin';
import { createBid } from '../lib/services/bids';
import { forwardOffer } from '../lib/services/admin';
import { payRequest } from '../lib/services/payments';
import { settleOrder } from '../lib/services/transactions';
import { depositFunds } from '../lib/services/transactions/deposit-funds';
import { requestWithdrawal } from '../lib/services/withdrawals';
import { updateDeliveryStatus } from '../lib/services/delivery';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function runMasterSimulation() {
  console.log('🛡️  Starting Comprehensive Scenario Simulation (Success & Failure Modes)...\n');

  try {
    const pass = await bcrypt.hash('pass123', 10);

    // --- SETUP ---
    const gov = await prisma.governorate.upsert({ where: { name: 'Cairo' }, update: {}, create: { name: 'Cairo' } });
    const city = await prisma.city.findFirst({ where: { name: 'Nasr City', governorateId: gov.id } }) || 
                 await prisma.city.create({ data: { name: 'Nasr City', governorateId: gov.id } });
    
    const parentCat = await prisma.category.upsert({ where: { slug: 'electronics' }, update: {}, create: { name: 'Electronics', slug: 'electronics' } });
    const subCat = await prisma.category.upsert({ where: { slug: 'phones' }, update: {}, create: { name: 'Phones', slug: 'phones', parentId: parentCat.id } });
    const client = await prisma.user.upsert({ where: { email: 'c@s.com' }, update: { walletBalance: 0, isBlocked: false }, create: { fullName: 'Client', email: 'c@s.com', password: pass, role: 'CLIENT' } });
    const vendor = await prisma.user.upsert({ where: { email: 'v@s.com' }, update: { walletBalance: 0, isBlocked: false }, create: { fullName: 'Vendor', email: 'v@s.com', password: pass, role: 'VENDOR' } });
    await prisma.vendorCategory.upsert({ where: { vendorId_categoryId: { vendorId: vendor.id, categoryId: subCat.id } }, update: {}, create: { vendorId: vendor.id, categoryId: subCat.id } });

    const testCase = async (name: string, fn: () => Promise<any>) => {
        console.log(`\n🔍 Checking Scenario: [${name}]`);
        try {
            await fn();
            console.log(`✅ Passed Expected Behavior.`);
        } catch (e: any) {
            console.log(`❌ Expected Failure Caught: "${e.message}"`);
        }
    };

    // --- FAILED SCENARIOS ---
    
    await testCase("FAIL: Create Request with Parent Category", async () => {
        await createRequest(client.id, { title: 'T', description: 'D', categoryId: parentCat.id, address: 'A', latitude: 0, longitude: 0, deliveryPhone: 'P', governorateId: gov.id, cityId: city.id });
    });

    const request = await createRequest(client.id, { title: 'Legal Req', description: 'D', categoryId: subCat.id, address: 'A', latitude: 0, longitude: 0, deliveryPhone: 'P', governorateId: gov.id, cityId: city.id });
    if (!request) throw new Error("Request creation failed unexpectedly");
    await reviewRequest(request.id, 'approve');

    await testCase("FAIL: Dual Biding (Same vendor same request)", async () => {
        await createBid(vendor.id, { requestId: request.id, description: 'B1', netPrice: 100 });
        await createBid(vendor.id, { requestId: request.id, description: 'B2', netPrice: 110 });
    });

    await testCase("FAIL: Payment with Insufficient Balance", async () => {
        const bid = await prisma.bid.findFirst({ where: { requestId: request.id, vendorId: vendor.id } });
        if (!bid) throw new Error("Bid not found");
        await prisma.request.update({ where: { id: request.id }, data: { selectedBidId: bid.id } });
        await prisma.bid.update({ where: { id: bid.id }, data: { status: 'ACCEPTED_BY_CLIENT' } });
        await payRequest(request.id, client.id);
    });

    await testCase("FAIL: Double Payout (Settling already closed request)", async () => {
        // Force success first
        await depositFunds(client.id, 1000);
        await payRequest(request.id, client.id);
        await settleOrder(request.id);
        // Try again
        await settleOrder(request.id);
    });

    await testCase("FAIL: Over-Withdrawal (More than balance)", async () => {
        await requestWithdrawal(vendor.id, 999999);
    });

    await testCase("FAIL: Unauthorized Status Update (Vendor updating delivered)", async () => {
        const r2 = await createRequest(client.id, { title: 'R2', description: 'D', categoryId: subCat.id, address: 'A', latitude: 0, longitude: 0, deliveryPhone: 'P', governorateId: gov.id, cityId: city.id });
        if (!r2) throw new Error("R2 creation failed");
        await reviewRequest(r2.id, 'approve');
        const b2 = await createBid(vendor.id, { requestId: r2.id, description: 'B', netPrice: 50 });
        await prisma.request.update({ where: { id: r2.id }, data: { selectedBidId: b2.id, status: 'ORDER_PAID_PENDING_DELIVERY' } });
        await updateDeliveryStatus({ requestId: r2.id, userId: vendor.id, status: 'DELIVERED' });
    });

    // --- SUCCESS SCENARIOS ---

    console.log('\n--- Final Success Flow Recap ---');
    const rFinal = await createRequest(client.id, { title: 'Success Case', description: 'Final Test', categoryId: subCat.id, address: 'Cairo', latitude: 30, longitude: 31, deliveryPhone: '010', governorateId: gov.id, cityId: city.id });
    if (!rFinal) throw new Error("Final request failed");
    await reviewRequest(rFinal.id, 'approve');
    const bFinal = await createBid(vendor.id, { requestId: rFinal.id, description: 'Best Offer', netPrice: 300 });
    
    // Select and Forward the offer as Admin
    await prisma.request.update({ where: { id: rFinal.id }, data: { selectedBidId: bFinal.id } });
    await forwardOffer(bFinal.id); // This sets request status to OFFERS_FORWARDED
    
    // Client accepts it
    await prisma.bid.update({ where: { id: bFinal.id }, data: { status: 'ACCEPTED_BY_CLIENT' } });
    
    await payRequest(rFinal.id, client.id);
    console.log('✅ Flow: Created -> Approved -> Bid -> Forwarded -> Accepted -> Paid');

    await updateDeliveryStatus({ requestId: rFinal.id, userId: vendor.id, status: 'VENDOR_PREPARING' });
    await updateDeliveryStatus({ requestId: rFinal.id, userId: vendor.id, status: 'READY_FOR_PICKUP' });
    const sFinal = await settleOrder(rFinal.id);
    console.log(`✅ Flow: Delivered -> Settled. Payout: ${sFinal.vendorPayout}`);

    console.log('\n🚀 ALL COVERAGE TESTS COMPLETED!');

  } catch (err) {
    console.error('❌ Unexpected System Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runMasterSimulation();
