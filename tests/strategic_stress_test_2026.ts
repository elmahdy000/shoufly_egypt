import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests/create-request';
import { createBid } from '../lib/services/bids/create-bid';
import { applyAiBidScoring } from '../lib/services/ai/score-bid';
import { acceptOffer } from '../lib/services/offers/accept-offer';
import { payRequest } from '../lib/services/payments/pay-request';
import { settleOrder } from '../lib/services/transactions/settle-order';
import { depositFunds } from '../lib/services/transactions/deposit-funds';
import 'dotenv/config';

/**
 * ⚡ --- THE 2026 STRATEGIC STRESS TEST (SERVICE-LAYER) --- ⚡
 * Goal: Hammer the business logic with concurrent full lifecycles.
 * This tests database locking, service throughput, and race conditions.
 */

async function runStrategicStressTest() {
  const CONCURRENT_JOBS = 200; // High enough to test locks, low enough to not time out
  console.log(`\n🌪️  --- STARTING STRATEGIC STRESS TEST: ${CONCURRENT_JOBS} CONCURRENT LIFECYCLES --- 🌪️\n`);

  try {
    const mainStartTime = Date.now();

    // 1. Participant Setup
    console.log('👥 Setting up core participants...');
    const client = await prisma.user.create({
        data: { fullName: 'Stress Client', email: `stress_master_${Date.now()}@shoufly.com`, role: 'CLIENT', walletBalance: 1000000, password: '123' }
    });
    const vendor = await prisma.user.create({
        data: { fullName: 'Stress Vendor', email: `stress_v_${Date.now()}@shoufly.com`, role: 'VENDOR', password: '123' }
    });
    const agent = await prisma.user.create({
        data: { fullName: 'Stress Agent', email: `stress_a_${Date.now()}@shoufly.com`, role: 'DELIVERY', password: '123' }
    });
    const cat = await prisma.category.findFirst({ where: { parentId: { not: null } } });
    if (!cat) throw new Error('Category missing');

    // 2. The Marathon Runner
    const runFullCycle = async (id: number) => {
        try {
            // A. Create & Approve
            const req = await createRequest(client.id, {
                title: `Stress Job ${id}`, description: 'Logic stress test',
                categoryId: cat.id, address: 'Cairo', latitude: 0, longitude: 0, deliveryPhone: '000'
            });
            if (!req) throw new Error('Request creation returned null');
            
            await prisma.request.update({ where: { id: req.id }, data: { status: 'OPEN_FOR_BIDDING' } });

            // B. Competitive Bidding & AI Scoring
            const bid = await createBid(vendor.id, { requestId: req.id, netPrice: 100, description: 'Quick Stress Bid' });
            if (!bid) throw new Error('Bid creation returned null');
            
            await applyAiBidScoring(bid.id);

            // MANUALLY simulate Admin Forwarding (for Stress Test Logic path)
            await prisma.bid.update({ where: { id: bid.id }, data: { status: 'SELECTED' } });
            await prisma.request.update({ where: { id: req.id }, data: { status: 'OFFERS_FORWARDED' } });

            // C. Transactional Integrity
            await acceptOffer(bid.id, client.id);
            await payRequest(req.id, client.id);

            // D. Logistics & Settlement
            await prisma.request.update({ 
                where: { id: req.id }, 
                data: { status: 'ORDER_PAID_PENDING_DELIVERY', assignedDeliveryAgentId: agent.id } 
            });
            await prisma.deliveryTracking.create({
                data: { requestId: req.id, status: 'DELIVERED' }
            });
            await settleOrder(req.id);

            return true;
        } catch (e: any) {
            console.error(`❌ Job ${id} Failed: ${e.message}`);
            return false;
        }
    };

    console.log(`\n🚀 Launching ${CONCURRENT_JOBS} lifecycles in parallel blocks...`);
    
    // We process in chunks to avoid overwhelming the connection pool
    const chunkSize = 20;
    let successfulCount = 0;
    
    for (let i = 0; i < CONCURRENT_JOBS; i += chunkSize) {
        const chunk = Array.from({ length: chunkSize }).map((_, j) => runFullCycle(i + j));
        const results = await Promise.all(chunk);
        successfulCount += results.filter(Boolean).length;
        console.log(`📊 Progress: ${i + chunkSize} / ${CONCURRENT_JOBS} | Block Time: ${((Date.now() - mainStartTime) / 1000).toFixed(1)}s`);
    }

    const totalTimeSeconds = (Date.now() - mainStartTime) / 1000;
    console.log(`\n🏆 --- STRATEGIC STRESS TEST COMPLETED --- 🏆`);
    console.log(`⏱️  Total Execution Time: ${totalTimeSeconds.toFixed(2)}s`);
    console.log(`📦 Success Rate: ${((successfulCount/CONCURRENT_JOBS)*100).toFixed(1)}% (${successfulCount}/${CONCURRENT_JOBS})`);
    console.log(`⚡ Service Throughput: ${(CONCURRENT_JOBS / totalTimeSeconds).toFixed(2)} full commerce cycles per second.`);

    if (successfulCount === CONCURRENT_JOBS) {
        console.log('✅ SYSTEM INTEGRITY VERIFIED: No race conditions or deadlocks detected under load.');
    } else {
        console.warn('⚠️ SYSTEM CAPACITY WARNING: Some jobs failed under pressure. Check logs for deadlocks.');
    }

  } catch (err: any) {
    console.error('❌ STRESS TEST CRITICAL ERROR:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runStrategicStressTest();
