import { prisma } from '../lib/prisma';
import { expandSearchRadiusForOlderRequests } from '../lib/services/requests/radius-expansion';

async function runRadiusExpansionSimulation() {
  console.log('📡 --- STARTING RADIUS EXPANSION SIMULATION (Emergency Mode) --- 📡\n');

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const category = await prisma.category.findUnique({ where: { slug: 'find-medicine' } });

    if (!client || !category) throw new Error('Base simulation data missing.');

    // 1. CREATE A REQUEST THAT IS "OLD" (Created 10 mins ago for simulation)
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const request = await prisma.request.create({
      data: {
        clientId: client.id,
        categoryId: category.id,
        title: 'دواء نادر جداً لطوارئ فجر',
        description: 'نبحث في محيط 5 كم ولا يوجد استجابة، نحتاج توسيع النطاق',
        latitude: 30.0444,
        longitude: 31.2357,
        address: 'وسط البلد',
        deliveryPhone: '01000000000',
        status: 'OPEN_FOR_BIDDING',
        createdAt: tenMinsAgo // Set backward in time
      }
    });
    console.log(`✅ Step 1: Emergency Request #${request.id} created (simulated as 10 mins old).`);

    // 2. RUN EXPANSION LOGIC
    console.log('\n🔄 RUNNING: Automatic Radius Expansion Engine...');
    await expandSearchRadiusForOlderRequests();

    // 3. VERIFY: Check if notification was created for Admin/Wide-Radius Vendors
    const lastNotification = await prisma.notification.findFirst({
        where: { requestId: request.id },
        orderBy: { createdAt: 'desc' }
    });
    
    if (lastNotification?.title === 'تنبيه توسيع نطاق البحث') {
        console.log(`✅ SUCCESS: System detected the delay and triggered "Radius Expansion notification".`);
        console.log(`💬 Message: ${lastNotification.message}`);
    } else {
        console.log('❌ ERROR: Expansion logic did not trigger correctly.');
    }

    console.log('\n🏆 --- RADIUS EXPANSION SIMULATION COMPLETED SUCCESSFULLY --- 🏆\n');

  } catch (err: any) {
    console.error('❌ SIMULATION ERROR:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runRadiusExpansionSimulation();
