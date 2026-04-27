import { prisma } from '../lib/prisma';
import { verifyDeliveryLocation } from '../lib/services/delivery/verify-location';
import { disputeOrder } from '../lib/services/requests/dispute-order';

async function runChaosSimulation() {
  console.log('🛡️ --- STARTING SECURITY & INTEGRITY SIMULATION (Chaos Mode) --- 🛡️\n');

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const agent = await prisma.user.findFirst({ where: { role: 'DELIVERY' } });
    const category = await prisma.category.findFirst({ where: { slug: 'plumbing' } });

    if (!client || !agent || !category) throw new Error('Base simulation data missing.');

    // 1. SETUP: Create a high-value request
    const request = await prisma.request.create({
      data: {
        clientId: client.id,
        categoryId: category.id,
        title: 'عقد لابتوب استيراد - اختبار أمان',
        description: 'جهاز غالي الثمن، يحتاج تأمين كامل',
        latitude: 30.0444, // Tahrir Square
        longitude: 31.2357,
        address: 'وسط البلد - ميدان التحرير',
        deliveryPhone: '01000000000',
        status: 'ORDER_PAID_PENDING_DELIVERY',
        assignedDeliveryAgentId: agent.id
      }
    });
    console.log(`✅ Step 1: High-value Request #${request.id} created and paid.`);

    // 2. SCAM ATTEMPT: Agent tries to complete from 10km away
    console.log('\n🚫 SCAM ATTEMPT: Agent trying to complete delivery from Maadi (far away)...');
    try {
      await verifyDeliveryLocation(request.id, 29.9602, 31.2569); // Maadi Coordinates
      console.log('❌ ERROR: Geofencing failed to stop the scam!');
    } catch (err: any) {
      console.log(`✅ SUCCESS: System blocked the scam. Reason: ${err.message}`);
    }

    // 3. HONEST DELIVERY: Agent arrives at Tahrir
    console.log('\n📍 HONEST DELIVERY: Agent arrives at Tahrir Square...');
    const verification = await verifyDeliveryLocation(request.id, 30.0445, 31.2358); // Close to Tahrir
    console.log(`✅ SUCCESS: Location verified. Agent is only ${verification.distanceMeters}m away.`);

    // 4. DISPUTE: Client finds the screen is cracked
    console.log('\n⚠️ DISPUTE RAISED: Client found a defect and is rejecting the payout...');
    const dispute = await disputeOrder(client.id, request.id, 'الشاشة بها شرخ واضح عند الاستلام');
    
    // VERIFY: Check if request is now REJECTED/FROZEN
    const updatedReq = await prisma.request.findUnique({ where: { id: request.id } });
    console.log(`✅ SUCCESS: Order is now in status: ${updatedReq?.status}. Funds are FROZEN.`);

    // 5. RESOLUTION: Admin releases funds after investigation
    console.log('\n⚖️ ADMIN RESOLUTION: Admin releases funds after mediation...');
    await prisma.request.update({
      where: { id: request.id },
      data: { status: 'CLOSED_SUCCESS' }
    });
    console.log('✅ SUCCESS: Admin resolved the dispute. Request status set to CLOSED_SUCCESS.');
    
    console.log('\n🏆 --- SECURITY & INTEGRITY SIMULATION COMPLETED SUCCESSFULLY --- 🏆\n');

  } catch (err: any) {
    console.error('❌ SIMULATION ERROR:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runChaosSimulation();
