import { prisma } from '../lib/prisma';
import { acceptDeliveryTask } from '../lib/services/delivery/accept-delivery-task';

async function runRaceConditionAudit() {
  console.log('🏎️ --- STARTING DELIVERY RACE CONDITION AUDIT --- 🏎️');
  console.log('Scenario: 50 Agents attempting to claim 1 high-value delivery at the exact same millisecond.\n');

  try {
    // 1. Setup: Create 1 Request and 50 Agents
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const cat = await prisma.category.findFirst({ where: { parentId: { not: null } } });
    
    const request = await prisma.request.create({
        data: {
            clientId: client!.id, categoryId: cat!.id, title: 'Gold Rush Request', description: 'Limited Edition',
            address: 'Cairo', latitude: 30, longitude: 31, deliveryPhone: '010',
            status: 'ORDER_PAID_PENDING_DELIVERY'
        }
    });

    // Mark as READY_FOR_PICKUP to pass service check (Wait, I removed that check for simulation simplicity in the edit? No, I should keep it realistic.)
    await prisma.deliveryTracking.create({
        data: { requestId: request.id, status: 'READY_FOR_PICKUP' }
    });

    const agents = await prisma.user.findMany({ where: { role: 'DELIVERY' }, take: 50 });
    if (agents.length < 50) throw new Error('Not enough agents for race test. Run seeder first.');

    console.log(`🚀 LAUNCHING 50 CONCURRENT ATTACKS on Request #${request.id}...`);

    // 2. The Hammer: 50 simultaneous calls
    const results = await Promise.allSettled(
        agents.map((agent: { id: number }) => acceptDeliveryTask(request.id, agent.id))
    );

    // 3. ANALYSIS
    const winners = results.filter((r: PromiseSettledResult<any>) => r.status === 'fulfilled');
    const losers = results.filter((r: PromiseSettledResult<any>) => r.status === 'rejected');

    console.log('\n📊 --- RACE RESULTS ---');
    console.log(`🥇 Winners: ${winners.length} (Expected: 1)`);
    console.log(`❌ Losers: ${losers.length} (Expected: 49)`);

    if (losers.length > 0) {
        console.log('\n📉 Sample Failures:');
        losers.slice(0, 5).forEach((l: any, i: number) => console.log(`   ${i+1}. ${l.reason?.message || l.reason}`));
    }

    if (winners.length === 1) {
        console.log('✅ SUCCESS: System maintained integrity. No double-payouts possible.');
        const finalAgent = await prisma.request.findUnique({ 
            where: { id: request.id }, 
            select: { assignedDeliveryAgentId: true } 
        });
        console.log(`🏆 Final Assigned Agent ID: ${finalAgent?.assignedDeliveryAgentId}`);
    } else {
        console.log('🚨 FATAL ERROR: Race condition leak detected! Multiple agents assigned.');
    }

  } catch (err: any) {
    console.error('❌ AUDIT ERROR:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runRaceConditionAudit();
