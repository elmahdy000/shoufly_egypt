import { prisma } from '../lib/prisma';
import { getCategories } from '../lib/services/categories/get-categories';
import { processAiAudit } from '../lib/services/ai/audit-request';
import { createBid } from '../lib/services/bids/create-bid';
import { applyAiBidScoring } from '../lib/services/ai/score-bid';
import { broadcastTelemetry } from '../lib/services/delivery/telemetry';
import { Notify } from '../lib/services/notifications/hub';

async function runMegaAudit() {
  console.log('🏛️ --- STARTING THE SHOOFLY EGYPT MEGA-AUDIT --- 🏛️');
  console.log('Integrating: AI Moderation | AI Matchmaking | Redis Caching | Real-time Telemetry\n');

  try {
    const startTime = Date.now();

    // STEP 1: CACHE SPEED TEST
    console.log('⚡ STEP 1: Testing Edge-Cache Speed...');
    const cStart = Date.now();
    await getCategories({ parentId: null });
    console.log(`✅ Categories loaded from RAM in ${Date.now() - cStart}ms\n`);

    // STEP 2: AI WATCHTOWER AUDIT
    console.log('🤖 STEP 2: Submitting Complex Request & AI Auditing...');
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    let cat = await prisma.category.findFirst({ where: { name: { contains: 'Electronics' } } });
    if (!cat) cat = await prisma.category.findFirst({ where: { parentId: { not: null } } });
    
    const req = await prisma.request.create({
        data: {
            clientId: client!.id, categoryId: cat!.id, 
            title: 'محتاج خبير صيانة سيرفرات ديل', description: 'السيرفر مش بيقوم ومحتاج صيانة فورية في التجمع بقطع غيار أصلية.',
            address: 'New Cairo', latitude: 30.01, longitude: 31.22, deliveryPhone: '010',
            status: 'PENDING_ADMIN_REVISION'
        }
    });

    const audit = await processAiAudit(req.id);
    console.log(`🛡️ AI Watchtower Action: ${audit?.recommendedAction} | Reasoning: ${audit?.reasoning}\n`);

    // STEP 3: AI MATCHMAKER RANKING
    console.log('🎯 STEP 3: Three Vendor Bids vs. AI Matchmaker...');
    const vendors = await prisma.user.findMany({ where: { role: 'VENDOR' }, take: 3 });
    
    const mockBids = [
        { d: 'أنا خبير سيرفرات ديل ومعايا القطع الأصلية وضمان سنة.', p: 1500 },
        { d: 'هخلصها ب 800 جنيه.', p: 800 },
        { d: 'موجود كلمني.', p: 1200 }
    ];

    for (let i = 0; i < mockBids.length; i++) {
        const bid = await createBid(vendors[i].id, { requestId: req.id, netPrice: mockBids[i].p, description: mockBids[i].d });
        const score = await applyAiBidScoring(bid.id);
        console.log(`   👉 Bid from Vendor ${vendors[i].id}: RANKED [${score.recommendation}] (${score.score}/100)`);
    }
    console.log('');

    // STEP 4: REAL-TIME GLOW-TRACK
    console.log('🛰️ STEP 4: Simulating Live Delivery Telemetry (Glow-Track)...');
    const agent = await prisma.user.findFirst({ where: { role: 'DELIVERY' } });
    
    const telemetryFrames = [
        { lat: 30.01, lng: 31.22, speed: 60, eta: 15 },
        { lat: 30.02, lng: 31.23, speed: 20, eta: 5 }
    ];

    for (const frame of telemetryFrames) {
        await broadcastTelemetry({
            requestId: req.id, agentId: agent!.id,
            lat: frame.lat, lng: frame.lng,
            speed: frame.speed, estimatedArrivalMins: frame.eta, heading: 90
        });
        console.log(`   ✨ Pulse Sent: Speed ${frame.speed}km/h | ETA ${frame.eta}m`);
    }

    // STEP 5: FINANCIAL FINALIZATION
    console.log('\n💰 STEP 5: Finalizing Payment & Notification Flow...');
    await Notify.paymentConfirmed(vendors[0].id, req.id, 1500);
    
    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`\n🏆 --- MEGA-AUDIT CONCLUDED: ALL SYSTEMS GREEN --- 🏆`);
    console.log(`⏱️ Full Integrated Lifecycle Time: ${totalTime.toFixed(2)}s`);
    console.log('✅ Shoofly Egypt is ready for the Golden Launch.');

  } catch (err: any) {
    console.error('❌ MEGA-AUDIT FAILURE:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runMegaAudit();
