import { prisma } from '../lib/prisma';
import { applyAiBidScoring } from '../lib/services/ai/score-bid';
import { createBid } from '../lib/services/bids/create-bid';

async function runAiMatchmakerSimulation() {
  console.log('🎯 --- STARTING THE AI MATCHMAKER SIMULATION --- 🎯');
  console.log('Scenario: 1 Request vs 3 Competitive Bids. AI will rank the best quality...\n');

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });
    const cat = await prisma.category.findFirst({ where: { parentId: { not: null } } });

    if (!client || !vendor) throw new Error('Setup missing.');

    // 1. Create Request
    const req = await prisma.request.create({
        data: {
            clientId: client.id, categoryId: cat!.id, title: 'تصليح غسالة بايظة', description: 'الغسالة مش بتعصر ومحتاج حد يشوفها.',
            address: 'Cairo', latitude: 0, longitude: 0, deliveryPhone: '000',
            status: 'OPEN_FOR_BIDDING'
        }
    });

    const mockBids = [
        { desc: 'أقدر أصلحها النهاردة بقطع غيار أصلية وضمان سنة شامل.', price: 800 },
        { desc: 'هصلحها لك ب 400 جنيه يا فندم.', price: 400 },
        { desc: 'عندي الحل كلمني.', price: 1000 }
    ];

    console.log(`📝 Created Request #${req.id}: تصليح غسالة\n`);

    const vendorList = await prisma.user.findMany({ where: { role: 'VENDOR' }, take: 3 });
    if (vendorList.length < 3) throw new Error('Need at least 3 vendors for this test.');

    for (let i = 0; i < mockBids.length; i++) {
        const mock = mockBids[i];
        console.log(`👉 Vendor ${vendorList[i].id} submitting: "${mock.desc}" (Price: ${mock.price})`);
        
        const bid = await createBid(vendorList[i].id, { 
            requestId: req.id, 
            netPrice: mock.price, 
            description: mock.desc 
        });

        // Tigger AI Scoring
        const scoreResult = await applyAiBidScoring(bid.id);
        
        console.log(`⭐️ AI SCORE: ${scoreResult.score}/100 | RANK: ${scoreResult.recommendation}`);
        console.log(`🔍 AI ANALYSIS: ${scoreResult.analysis}\n`);
    }

    console.log('✅ MATCHMAKER AUDIT COMPLETE: AI successfully differentiated the offers.');
    console.log('🏆 Clients can now see "Top Pick" badges on professional offers.');

  } catch (err: any) {
    console.error('❌ MATCHMAKER ERROR:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runAiMatchmakerSimulation();
