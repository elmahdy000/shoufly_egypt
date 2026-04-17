import { prisma } from '../lib/prisma';

async function simulateEscrowUnlockFlow() {
  console.log('🎬 STARTING ESCROW-UNLOCK SIMULATION: Secure interaction after payment...');

  // 1. SETUP: Client (Ahmed) and Category (Pharmacy - PRODUCT)
  const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
  const cat = await prisma.category.findUnique({ where: { slug: 'find-medicine' } });
  
  if (!client || !cat) return console.error('Required data missing.');

  // 2. REQUEST CREATION 
  const request = await prisma.request.create({
    data: {
      clientId: client.id,
      categoryId: cat.id,
      title: 'طلب دواء طوارئ',
      description: 'أبحث عن علبة دواء معينة توصيل فوري',
      address: 'مصر الجديدة - الحي السابع',
      deliveryPhone: '01012345678',
      latitude: 30.0594885, // New Cairo / Heliopolis area
      longitude: 31.1884236,
      status: 'OPEN_FOR_BIDDING'
    }
  });
  console.log('✅ Step 1: Request Created. Communication is currently LOCKED.');

  // 3. BIDDING & ACCEPTANCE
  console.log('✅ Step 2: Vendors bid. Client accepts a 200 EGP Bid.');

  // 4. THE ESCROW MOMENT (الدفع للمنصة)
  console.log('\n--- 💳 ESCROW LOCKING PHASE ---');
  console.log('Action: Client pays 200 EGP + 50 EGP Delivery to SHOOFLY PLATFORM.');
  
  await prisma.transaction.create({
    data: {
      userId: client.id,
      requestId: request.id,
      amount: 250,
      type: 'ESCROW_DEPOSIT',
      description: 'Pre-payment for Request ' + request.id + ' (Funds held by Shoofly)'
    }
  });
  console.log('💰 TRANSACTION SUCCESS: Funds are now held by Shoofly.');

  // 5. UNLOCK COMMUNICATION (تفعيل التواصل)
  console.log('\n--- 🔓 COMMUNICATION UNLOCKED ---');
  console.log('EVENT: System notifies Mandoob: "Payment confirmed! You can now call the Client."');
  console.log('EVENT: System shows Client: "Mandoob is on the way. His number: 010xxxxxxxx"');
  console.log('COORD: Mandoob calls Client: "أنا تحت العمارة يا فندم، افتحي لي بوابات الجراج"');

  // 6. DELIVERY & RELEASE
  console.log('\n--- 📦 DELIVERY & FUNDS RELEASE ---');
  console.log('Action: Client clicks "Item Received" in App.');
  console.log('1. Release 200 EGP to Pharmacy.');
  console.log('2. Release 50 EGP to Mandoob.');
  console.log('3. Flow complete.');

  console.log('\n🏁 ESCROW-UNLOCK SIMULATION COMPLETED: Guaranteed commitment for all sides.');
}

simulateEscrowUnlockFlow()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
