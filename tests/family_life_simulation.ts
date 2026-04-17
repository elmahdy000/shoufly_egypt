import { prisma } from '../lib/prisma';

async function simulateFamilyDay() {
  console.log('🎬 STARTING SIMULATION: A day in the life of Esrat Ahmed (Egyptian Family)...');

  // Find a Client (Ahmed)
  const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
  if (!client) {
    console.error('No client found. Please run register/login simulation first.');
    return;
  }

  // 1. Ahmed: Car Noise (SERVICE)
  const catCar = await prisma.category.findUnique({ where: { slug: 'car-repair' } });
  const req1 = await prisma.request.create({
    data: {
      clientId: client.id,
      categoryId: catCar!.id,
      title: 'صوت خبط في الموتور - تويوتا كورولا',
      description: 'في صوت خبط واضح مع الطلعة، محتاج فني يجي يشوف السيارة في المنزل',
      latitude: 30.0771,
      longitude: 31.3421,
      address: 'مصر الجديدة - ميدان تريومف - بجوار بنك مصر',
      deliveryPhone: '01012345678',
      status: 'OPEN_FOR_BIDDING'
    }
  });
  console.log('✅ Request 1 (Ahmed): Car Repair (SERVICE) Created.');

  // 2. Mona: Dinner for 15 (PRODUCT)
  const catFood = await prisma.category.findUnique({ where: { slug: 'home-cooked-meals' } });
  const req2 = await prisma.request.create({
    data: {
      clientId: client.id,
      categoryId: catFood!.id,
      title: 'عزومة 15 فرد - محاشي ومشويات',
      description: 'محتاجة أكل بيتي نظيف لعزومة عائلية مساء اليوم، التوصيل قبل الساعة 7',
      latitude: 30.0771,
      longitude: 31.3421,
      address: 'مصر الجديدة - شارع النزهة - عمارة 55',
      deliveryPhone: '01112345678',
      status: 'OPEN_FOR_BIDDING'
    }
  });
  console.log('✅ Request 2 (Mona): Home Food (PRODUCT) Created.');

  // 3. Omar: Laptop Upgrade (PRODUCT)
  const catPC = await prisma.category.findUnique({ where: { slug: 'pc-parts' } });
  const req3 = await prisma.request.create({
    data: {
      clientId: client.id,
      categoryId: catPC!.id,
      title: 'محتاج رامات 16 جيجا وهارد SSD 512',
      description: 'لابتوب Dell G3، محتاج القطع وتكون أصلية بضمان',
      latitude: 30.0771,
      longitude: 31.3421,
      address: 'مصر الجديدة - شارع الميرغني',
      deliveryPhone: '01212345678',
      status: 'OPEN_FOR_BIDDING'
    }
  });
  console.log('✅ Request 3 (Omar): PC Parts (PRODUCT) Created.');

  // 4. Omar: Engineering Lesson (DIGITAL)
  const catStudy = await prisma.category.findUnique({ where: { slug: 'explain-lesson' } });
  const req4 = await prisma.request.create({
    data: {
      clientId: client.id,
      categoryId: catStudy!.id,
      title: 'شرح مسألة ميكانيكا (ديناميكا)',
      description: 'محتاج محاضرة أونلاين سريعة لشرح جزء المقذوفات وحل مسألة معينة',
      latitude: 30.0771,
      longitude: 31.3421,
      address: 'أونلاين (رقمي)',
      deliveryPhone: '01000000000',
      status: 'OPEN_FOR_BIDDING'
    }
  });
  console.log('✅ Request 4 (Omar): Education (DIGITAL) Created.');

  // 5. Grandpa: Missing Medicine (PRODUCT)
  const catMeds = await prisma.category.findUnique({ where: { slug: 'find-medicine' } });
  const req5 = await prisma.request.create({
    data: {
      clientId: client.id,
      categoryId: catMeds!.id,
      title: 'دواء Concor 5mg - علبتين',
      description: 'الدواء مش لاقينه في الصيدليات المحيطة، برجاء الإفادة لو متوفر وتوصيله فوراً',
      latitude: 30.0771,
      longitude: 31.3421,
      address: 'مصر الجديدة - مساكن شيراتون',
      deliveryPhone: '01512345678',
      status: 'OPEN_FOR_BIDDING'
    }
  });
  console.log('✅ Request 5 (Grandpa): Meds (PRODUCT) Created.');

  console.log('\n--- SYSTEM ANALYSIS ---');
  console.log('Request 1 Type:', catCar!.type, '-> Action: Tech must visit Client.');
  console.log('Request 2 Type:', catFood!.type, '-> Action: Needs Shoofly Delegate (Rider).');
  console.log('Request 3 Type:', catPC!.type, '-> Action: Needs Shoofly Delegate (Rider).');
  console.log('Request 4 Type:', catStudy!.type, '-> Action: Digital Chat/Video Session.');
  console.log('Request 5 Type:', catMeds!.type, '-> Action: Tech (Pharmacy) notifies Delegate for pick-up.');

  console.log('\n🏁 SIMULATION COMPLETED: The family is now waiting for offers from specialized vendors!');
}

simulateFamilyDay()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
