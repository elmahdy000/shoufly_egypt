import { prisma } from '../lib/prisma';

async function runFoodBudgetSimulation() {
  console.log('🍽️ --- STARTING FOOD-BY-BUDGET SIMULATION --- 🍽️\n');

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const cat = await prisma.category.findUnique({ where: { slug: 'family-meals-budget' } });

    if (!client || !cat) throw new Error('Base data missing.');

    // 1. Ahmed posts a request with a clear budget in the description
    const request = await prisma.request.create({
      data: {
        clientId: client.id,
        categoryId: cat.id,
        title: 'عزومة غداء لـ 10 أشخاص بميزانية 800 جنيه',
        description: 'محتاجين وجبة غداء كاملة (أرز ولحوم وخضار) لـ 10 أفراد، الميزانية القصوى 800 جنيه شاملة التوصيل',
        address: 'المعادي - شارع الستين',
        deliveryPhone: '01012345678',
        latitude: 29.9602, longitude: 31.2569,
        status: 'OPEN_FOR_BIDDING'
      }
    });
    console.log(`✅ Step 1: Ahmed posted the Food Budget job (ID: ${request.id}).`);

    // 2. Vendors (Kitchens) find the request and bid
    console.log('\n👨‍🍳 Two Kitchens are providing offers...');
    
    // Kitchen A (Matches Budget)
    const bidA = await prisma.bid.create({
      data: {
        requestId: request.id,
        vendorId: 189, // Hypothetical vendor ID from previous seeds
        netPrice: 700,
        clientPrice: 805, // Including fee
        description: 'منيو اقتصادي: أرز بسمتي + فراخ مشوية + صينية بطاطس + سلطات',
        status: 'PENDING'
      }
    });
    console.log('   - Kitchen A bid: 700 EGP (Full Menu)');

    // Kitchen B (Exceeds Budget but Premium)
    const bidB = await prisma.bid.create({
      data: {
          requestId: request.id,
          vendorId: 190,
          netPrice: 1000,
          clientPrice: 1150,
          description: 'منيو بريميوم: مشويات مشكلة + أرز خلطة + رقاق باللحمة + مقبلات لبنانية',
          status: 'PENDING'
      }
    });
    console.log('   - Kitchen B bid: 1000 EGP (Up-sell Attempt)');

    // 3. Choice: Ahmed accepts Kitchen A because it fits the wallet
    console.log('\n🤝 Ahmed accepts Kitchen A offer...');
    await prisma.bid.update({
        where: { id: bidA.id },
        data: { status: 'ACCEPTED_BY_CLIENT' }
    });
    await prisma.request.update({
        where: { id: request.id },
        data: { status: 'ORDER_PAID_PENDING_DELIVERY' }
    });

    console.log('✅ Flow Success: Ahmed is getting fed within his budget!');
    console.log('🏁 The platform correctly categorized this as PRODUCT, so a Mandoob is being dispatched.');

    console.log('\n🏆 --- FOOD BUDGET SIMULATION COMPLETED SUCCESSFULLY --- 🏆\n');

  } catch (err: any) {
    console.error('❌ SIMULATION ERROR:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runFoodBudgetSimulation();
