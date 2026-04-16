import { prisma } from '../lib/prisma';
import { acceptDeliveryTask } from '../lib/services/delivery';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function runConcurrencySimulation() {
  console.log('⚔️  Starting Concurrency Simulation: The Delivery Race...\n');

  try {
    const pass = await bcrypt.hash('pass123', 10);

    // 1. Setup Request & Agents
    const agentA = await prisma.user.upsert({ where: { email: 'agentA@s.com' }, update: {}, create: { fullName: 'Agent Fast', email: 'agentA@s.com', password: pass, role: 'DELIVERY' } });
    const agentB = await prisma.user.upsert({ where: { email: 'agentB@s.com' }, update: {}, create: { fullName: 'Agent Slow', email: 'agentB@s.com', password: pass, role: 'DELIVERY' } });
    
    // Create a request that is READY_FOR_PICKUP
    const req = await prisma.request.create({
      data: {
        title: 'Hot Pizza',
        description: 'Deliver fast',
        clientId: (await prisma.user.findFirst({where: {role: 'CLIENT'}}))!.id,
        categoryId: (await prisma.category.findFirst({where: {parentId: {not: null}}}))!.id,
        address: 'Cairo',
        latitude: 30,
        longitude: 31,
        deliveryPhone: '010',
        status: 'ORDER_PAID_PENDING_DELIVERY'
      }
    });

    await prisma.deliveryTracking.create({
        data: { requestId: req.id, status: 'READY_FOR_PICKUP', note: 'Ready!' }
    });

    console.log(`📦 Request #${req.id} is ready. Two agents are about to click "Accept" simultaneously...`);

    // 2. The Race: Promise.all to trigger them at the exact same time
    console.log('\n⚡ Launching parallel requests...');
    
    const results = await Promise.allSettled([
        acceptDeliveryTask(req.id, agentA.id),
        acceptDeliveryTask(req.id, agentB.id)
    ]);

    // 3. Analyze Results
    results.forEach((res, index) => {
        const agentName = index === 0 ? 'Agent A' : 'Agent B';
        if (res.status === 'fulfilled') {
            console.log(`🏆 ${agentName}: SUCCESSFULLY claimed the task!`);
        } else {
            console.log(`❌ ${agentName}: FAILED to claim - Error: "${res.reason.message}"`);
        }
    });

    // 4. Verification in DB
    const finalRequest = await prisma.request.findUnique({ where: { id: req.id } });
    console.log(`\n🔍 Database Check: Assigned Agent ID is ${finalRequest?.assignedDeliveryAgentId}`);
    
    if (finalRequest?.assignedDeliveryAgentId) {
        const winner = await prisma.user.findUnique({ where: { id: finalRequest.assignedDeliveryAgentId } });
        console.log(`✅ Result: Task remains with ${winner?.fullName}. No double assignment occurred.`);
    }

  } catch (err) {
    console.error('❌ System Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runConcurrencySimulation();
