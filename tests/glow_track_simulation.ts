import { prisma } from '../lib/prisma';

/**
 * SIMULATOR: LIVE TRACKING ENGINE
 * Demonstrates the "Glow-Track" logic and dynamic ETA updates.
 */
async function runGlowTrackSimulation() {
  console.log('🛰️ --- STARTING "GLOW-TRACK" REAL-TIME SIMULATION --- 🛰️\n');

  // 1. SETUP: Find or Create a client and category
  const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
  const category = await prisma.category.findFirst({ where: { slug: 'pc-parts' } });

  if (!client || !category) return console.error('Base data missing.');

  // Create a dedicated demo request for tracking
  const request = await prisma.request.create({
    data: {
      clientId: client.id,
      categoryId: category.id,
      title: 'أوردر تتبع حي - تجربة الـ Glow-Track',
      description: 'أوردر تجريبي لمشاهدة حركة المندوب على الخريطة',
      status: 'ORDER_PAID_PENDING_DELIVERY',
      address: 'المعادي - شارع 9',
      latitude: 29.9602,
      longitude: 31.2569,
      deliveryPhone: '01011111111'
    }
  });

  console.log(`✅ Demo Request Created (ID: ${request.id}). Status: ORDER_PAID_PENDING_DELIVERY`);

  // Starting Point: Vendor (Simulated near Heliopolis)
  let currentLat = 30.0771;
  let currentLon = 31.3421;

  // Target Point: Client (Simulated slightly away)
  const targetLat = Number(request.latitude);
  const targetLon = Number(request.longitude);

  console.log(`🚚 Mandoob starting journey to Client at: ${request.address}`);

  // Simulating 5 steps of movement
  for (let i = 1; i <= 5; i++) {
    // Move 20% closer each step
    currentLat += (targetLat - currentLat) * 0.2;
    currentLon += (targetLon - currentLon) * 0.2;
    
    // Simulate dynamic speed (30km/h to 80km/h)
    const speed = 30 + Math.random() * 50;
    
    // THE "GLOW-TRACK" UNIQUE LOGIC: Intelligent status messages
    let moodNote = 'المندوب في الطريق إليك';
    if (speed > 60) moodNote = 'المندوب منطلق الآن على الطريق السريع 🚀';
    if (speed < 40) moodNote = 'المندوب بانتظار إشارة المرور أو في منطقة مزدحمة 🚦';

    console.log(`📍 Step ${i}: Lat ${currentLat.toFixed(4)}, Lon ${currentLon.toFixed(4)} | Speed: ${speed.toFixed(1)} km/h`);

    // RECORD TRACKING DATA
    await prisma.deliveryTracking.create({
      data: {
        requestId: request.id,
        status: 'IN_TRANSIT',
        latitude: currentLat,
        longitude: currentLon,
        speed: speed,
        note: moodNote,
        locationText: `الآن في الطريق، المسافة المتبقية تقل...`
      }
    });

    console.log(`💬 Notification to Client: ${moodNote}`);
    
    // Brief pause to simulate progression (500ms for demo)
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🏁 GLOW-TRACK SIMULATION COMPLETED: Agent is arriving at destination.');
  
  // Final update to "Delivered"
  await prisma.deliveryTracking.create({
    data: {
      requestId: request.id,
      status: 'DELIVERED',
      latitude: targetLat,
      longitude: targetLon,
      speed: 0,
      note: 'تم الوصول! المندوب أمام منزلك الآن 🏁',
      locationText: request.address
    }
  });

  console.log('✅ Final Status: AGENT ARRIVED.');
}

runGlowTrackSimulation()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
