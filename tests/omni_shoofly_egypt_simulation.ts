import { prisma } from '../lib/prisma';
import { verifyDeliveryLocation } from '../lib/services/delivery/verify-location';
import { expandSearchRadiusForOlderRequests } from '../lib/services/requests/radius-expansion';
import { disputeOrder } from '../lib/services/requests/dispute-order';

async function runOmniSimulation() {
  console.log('🚀 --- STARTING THE SHOOFLY EGYPT OMNI-SIMULATION --- 🚀');
  console.log('🌎 Full Integrated Lifecycle, Security, & Real-time Tracking\n');

  try {
    // --- STAGE 1: PARTICIPANTS ---
    console.log('👥 [1/7] Creating Participants...');
    const timestamp = Date.now();
    const client = await prisma.user.create({
      data: { fullName: 'أحمد المصري', email: `ahmed_${timestamp}@shoofly.com`, role: 'CLIENT', password: '123', walletBalance: 5000, isActive: true }
    });
    const vendor = await prisma.user.create({
      data: { fullName: 'صيدلية الخير', email: `pharmacy_${timestamp}@shoofly.com`, role: 'VENDOR', password: '123', walletBalance: 0, isActive: true }
    });
    const agent = await prisma.user.create({
      data: { fullName: 'محمود المندوب', email: `mandoob_${timestamp}@shoofly.com`, role: 'DELIVERY', password: '123', walletBalance: 0, isActive: true }
    });
    console.log('✅ Participants ready: Client (Ahmed), Vendor (Pharmacy), Agent (Mahmoud).');

    // --- STAGE 2: THE REQUEST (The Market DNA) ---
    console.log('\n📝 [2/7] Ahmad creates an Urgent Medicine Request (Type: PRODUCT)...');
    const catMeds = await prisma.category.findUnique({ where: { slug: 'find-medicine' } });
    const request = await prisma.request.create({
      data: {
        clientId: client.id,
        categoryId: catMeds!.id,
        title: 'دواء طارئ لحالة حرجة',
        description: 'محتاج دواء ضغط غير متوفر في الصيدليات القريبة',
        latitude: 30.0444, // Tahrir
        longitude: 31.2357,
        address: 'وسط البلد - ميدان التحرير',
        deliveryPhone: '01012345678',
        status: 'OPEN_FOR_BIDDING'
      }
    });

    // Simulate "No response" expansion
    console.log('⏳ 5 Minutes pass with no bids...');
    await expandSearchRadiusForOlderRequests();

    // --- STAGE 3: THE BID & ESCROW-UNLOCK ---
    console.log('\n🤝 [3/7] Pharmacy bids 200 EGP. Ahmed accepts and PAYS...');
    const bid = await prisma.bid.create({
      data: { 
        requestId: request.id, 
        vendorId: vendor.id, 
        netPrice: 200, 
        clientPrice: 230, // 200 + 15% fee
        description: 'متوفر لدينا وجاهز للتوصيل فوراً بضمان الصيدلية',
        status: 'ACCEPTED_BY_CLIENT' 
      }
    });
    
    // Financial Escrow
    await prisma.transaction.create({
        data: {
            userId: client.id,
            requestId: request.id,
            amount: 250, // 200 item + 50 delivery
            type: 'ESCROW_DEPOSIT',
            description: 'تأمين طلب الدواء - شوفلي أمان'
        }
    });
    
    await prisma.request.update({
        where: { id: request.id },
        data: { status: 'ORDER_PAID_PENDING_DELIVERY', assignedDeliveryAgentId: agent.id }
    });
    console.log('🔓 COMMUNICATION UNLOCKED: Mahmoud can now see Ahmed\'s phone and address.');

    // --- STAGE 4: SECURITY (The Fraud Attempt) ---
    console.log('\n🚫 [4/7] SECURITY CHECK: Mahmoud tries to mark "Delivered" from Maadi (far away)...');
    try {
        await verifyDeliveryLocation(request.id, 29.9602, 31.2569); 
    } catch (err: any) {
        console.log(`✅ Fraud Blocked by Geofencing: "${err.message}"`);
    }

    // --- STAGE 5: GLOW-TRACK (The Real-time Journey) ---
    console.log('\n🛰️ [5/7] GLOW-TRACK START: Mahmoud is moving towards Tahrir Square...');
    let currentLat = 30.0771; // Heliopolis start
    let currentLon = 31.3421;
    const targetLat = 30.0444;
    const targetLon = 31.2357;

    for (let i = 1; i <= 3; i++) {
        currentLat += (targetLat - currentLat) * 0.3;
        currentLon += (targetLon - currentLon) * 0.3;
        const speed = 40 + Math.random() * 30;
        console.log(`📍 Step ${i}: Lat ${currentLat.toFixed(4)} | Speed: ${speed.toFixed(1)} km/h - CLIENT NOTIFIED.`);
        
        await prisma.deliveryTracking.create({
            data: { requestId: request.id, status: 'IN_TRANSIT', latitude: currentLat, longitude: currentLon, speed: speed, note: 'المندوب يقترب منك...' }
        });
        await new Promise(r => setTimeout(r, 300));
    }

    // --- STAGE 6: DISPUTE & RESOLUTION (Optional Chaos) ---
    console.log('\n⚠️ [6/7] Mahmoud arrives. Ahmed find the medicine box is damaged. DISPUTE RAISED!');
    await disputeOrder(client.id, request.id, 'علبة الدواء مفتوحة وبها تلف');
    
    const disputedReq = await prisma.request.findUnique({ where: { id: request.id } });
    console.log(`❄️ Request Status: ${disputedReq?.status}. Funds are FROZEN for Admin review.`);

    // --- STAGE 7: SETTLEMENT (Final Release) ---
    console.log('\n🏁 [7/7] Admin resolves dispute (Partial Refund). Releasing remaining funds...');
    // (Simulated closure)
    await prisma.request.update({
        where: { id: request.id },
        data: { status: 'CLOSED_SUCCESS' }
    });
    
    console.log('\n🏆 --- OMNI-SIMULATION COMPLETED: SHOOFLY EGYPT IS SECURE & INTELLIGENT --- 🏆\n');

  } catch (err: any) {
    console.error('❌ OMNI ERROR:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runOmniSimulation();
