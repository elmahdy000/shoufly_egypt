import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests/create-request';
import { createBid } from '../lib/services/bids/create-bid';
import { payRequest } from '../lib/services/payments/pay-request';
import { createRefund } from '../lib/services/refunds/create-refund';
import { reviewRequest } from '../lib/services/admin/review-request';
import 'dotenv/config';

/**
 * 🛡️ --- SHOOFLY EGYPT PRODUCTION GUARD MEGA TEST --- 🛡️
 * Final verification of all edge cases, security blocks, and logical constraints.
 */

async function runProductionGuard() {
  console.log('🚧 Starting Production Guard Mega Test...\n');
  const results: string[] = [];

  const logResult = (name: string, passed: boolean) => {
    results.push(`${passed ? '✅' : '❌'} ${name}`);
    console.log(`${passed ? '✅' : '❌'} ${name}`);
  };

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });
    const cat = await prisma.category.findFirst({ where: { parentId: { not: null } } });
    const cairo = await prisma.governorate.findFirst({ where: { name: 'القاهرة' } });
    const cairoCity = await prisma.city.findFirst({ where: { governorateId: cairo?.id } });
    const alexCity = await prisma.city.findFirst({ where: { governorate: { name: 'الإسكندرية' } } });

    if (!client || !vendor || !cat || !cairo || !cairoCity || !alexCity) throw new Error('Prerequisites missing');

    // 1. BLOCKED USER PROTECTION
    try {
        await prisma.user.update({ where: { id: client.id }, data: { isBlocked: true } });
        await createRequest(client.id, { 
            title: 'Illegal', description: '...', categoryId: cat.id, address: '...', latitude: 0, longitude: 0, 
            deliveryPhone: '000', governorateId: cairo.id, cityId: cairoCity.id 
        });
        logResult('Block User Check', false);
    } catch (e: any) {
        logResult('Block User Check', e.message.includes('محظور'));
    } finally {
        await prisma.user.update({ where: { id: client.id }, data: { isBlocked: false } });
    }

    // 2. LOCATION CONSISTENCY GUARD
    try {
        await createRequest(client.id, { 
            title: 'Mismatched', description: '...', categoryId: cat.id, 
            address: '...', latitude: 0, longitude: 0, deliveryPhone: '000',
            governorateId: cairo.id, cityId: alexCity.id
        });
        logResult('Location Consistency', false);
    } catch (e: any) {
        logResult('Location Consistency', e.message.includes('تتبع'));
    }

    // 3. INVALID STATUS TRANSITION (Pay Rejected)
    try {
        const req = await createRequest(client.id, { 
            title: 'Rejected Job', description: '...', categoryId: cat.id, 
            address: '...', latitude: 0, longitude: 0, deliveryPhone: '000',
            governorateId: cairo.id, cityId: cairoCity.id
        });
        await reviewRequest(req!.id, 'reject');
        await payRequest(req!.id, client.id);
        logResult('Status Immunity (Pay Rejected)', false);
    } catch (e: any) {
        logResult('Status Immunity (Pay Rejected)', e.message.includes('الحالة'));
    }

    // 4. DOUBLE REFUND PREVENTION
    try {
        const refundReq = await createRequest(client.id, { 
            title: 'Refundable', description: '...', categoryId: cat.id, address: '...', 
            latitude: 0, longitude: 0, deliveryPhone: '000',
            governorateId: cairo.id, cityId: cairoCity.id
        });
        await prisma.request.update({ where: { id: refundReq!.id }, data: { status: 'ORDER_PAID_PENDING_DELIVERY' } });
        await prisma.transaction.create({ 
            data: { userId: client.id, requestId: refundReq!.id, amount: 500, type: 'ESCROW_DEPOSIT', description: 'Real Escrow' } 
        });

        await createRefund({ requestId: refundReq!.id, adminId: 1, reason: 'First Refund' });
        // Try again
        await createRefund({ requestId: refundReq!.id, adminId: 1, reason: 'Duplicate Refund' });
        logResult('Double Refund Prevention', false);
    } catch (e: any) {
        logResult('Double Refund Prevention', e.message.includes('بالفعل'));
    }

    // 5. ATOMIC WALLET CONCURRENCY
    console.log('\n⏳ Running Atomic Concurrency Check...');
    await prisma.user.update({ where: { id: client.id }, data: { walletBalance: 1000 } });
    
    // Create 3 valid, payable requests
    const payableReqs = [];
    for (let i = 0; i < 3; i++) {
        const r = await createRequest(client.id, { 
            title: `Concurrent Pay ${i}`, description: '...', categoryId: cat.id, 
            address: '...', latitude: 0, longitude: 0, deliveryPhone: '000',
            governorateId: cairo.id, cityId: cairoCity.id
        });
        const b = await prisma.bid.create({
            data: { requestId: r!.id, vendorId: vendor.id, netPrice: 100, clientPrice: 115, status: 'ACCEPTED_BY_CLIENT', description: '...' }
        });
        await prisma.request.update({ where: { id: r!.id }, data: { status: 'OFFERS_FORWARDED', selectedBidId: b.id } });
        payableReqs.push(r);
    }

    const concurrentPayments = payableReqs.map((r: any) => payRequest(r!.id, client.id).catch((e: any) => e.message));
    const walletResults = await Promise.all(concurrentPayments);
    
    const finalBalance = await prisma.user.findUnique({ where: { id: client.id }, select: { walletBalance: true } });
    const successCount = walletResults.filter((r: any) => typeof r === 'object').length;
    logResult('Atomic Concurrency', successCount === 3 && Number(finalBalance!.walletBalance) === (1000 - (3 * 115)));

    console.log('\n🏁 --- PRODUCTION GUARD SUMMARY --- 🏁');
    results.forEach((r: string) => console.log(r));

    if (results.some((r: string) => r.startsWith('❌'))) {
        console.error('\n🚩 CRITICAL: Some production guards failed. Review logic!');
        process.exit(1);
    } else {
        console.log('\n✅ ALL SYSTEMS GREEN. PRODUCTION DEPLOYMENT RECOMMENDED.');
    }

  } catch (err: any) {
    console.error('💥 PRODUCTION GUARD CRASHED:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runProductionGuard();
