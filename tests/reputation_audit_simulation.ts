import { prisma } from '../lib/prisma';
import { disputeOrder } from '../lib/services/requests/dispute-order';

async function runReputationAuditSimulation() {
  console.log('🧐 --- STARTING VENDOR REPUTATION & AUDIT SIMULATION --- 🧐\n');

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });
    const category = await prisma.category.findFirst({ where: { slug: 'pc-parts' } });

    if (!client || !vendor || !category) throw new Error('Base simulation data missing.');

    console.log(`👤 Auditing Vendor: ${vendor.fullName} (ID: ${vendor.id})`);

    // 1. Setup: Create a request and an accepted bid for this vendor
    const request = await prisma.request.create({
      data: {
        clientId: client.id,
        categoryId: category.id,
        title: 'طلب قطع غيار - فحص جودة',
        description: 'اختبار نظام البلاغات',
        status: 'ORDER_PAID_PENDING_DELIVERY',
        address: 'القاهرة',
        deliveryPhone: '010',
        latitude: 0, longitude: 0
      }
    });

    await prisma.bid.create({
      data: {
        requestId: request.id,
        vendorId: vendor.id,
        netPrice: 1000,
        clientPrice: 1150,
        description: 'Original Parts',
        status: 'ACCEPTED_BY_CLIENT'
      }
    });

    // 2. Action: Client disputes the order
    console.log('\n⚠️ Client is raising a DISPUTE against this vendor...');
    await disputeOrder(client.id, request.id, 'القطع المستلمة ليست أصلية وبها خدوش');

    // 3. Verification: Query the Vendor Reputation Profile
    console.log('\n🔍 --- ADMIN VIEW: VENDOR REPUTATION PROFILE ---');
    const vendorProfile = await prisma.user.findUnique({
      where: { id: vendor.id },
      include: {
        complaintsReceived: {
          include: { user: { select: { fullName: true } } }
        }
      }
    });

    console.log(`📊 Statistics for ${vendorProfile?.fullName}:`);
    console.log(`🚩 Total Complaints Received: ${vendorProfile?.complaintsReceived.length}`);
    
    vendorProfile?.complaintsReceived.forEach((c, i) => {
      console.log(`   [${i+1}] From: ${c.user.fullName} | Issue: ${c.description} | Status: ${c.status}`);
    });

    if (vendorProfile && vendorProfile.complaintsReceived.length > 0) {
        console.log('\n✅ SUCCESS: The incident is now permanently recorded in the Vendor\'s profile.');
    } else {
        console.log('\n❌ ERROR: Dispute was not recorded correctly.');
    }

    console.log('\n🏆 --- REPUTATION SIMULATION COMPLETED SUCCESSFULLY --- 🏆\n');

  } catch (err: any) {
    console.error('❌ SIMULATION ERROR:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runReputationAuditSimulation();
