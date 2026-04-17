import { prisma } from '../lib/prisma';
import { registerUser } from '../lib/api/auth';
import { createClientRequest, listVendorOpenRequests } from '../lib/api/requests';
import { submitBid } from '../lib/api/bids';
import { acceptOffer } from '../lib/services/offers/accept-offer';
import { settleOrder } from '../lib/services/transactions/settle-order';
import { updateDeliveryStatus } from '../lib/services/delivery/update-delivery-status';

async function runLocationSimulation() {
  console.log('🌍 Starting Geographical Lifecycle Simulation...');

  // 1. Setup Locations
  const cairo = await prisma.governorate.findFirst({ where: { name: 'القاهرة' } });
  const alex = await prisma.governorate.findFirst({ where: { name: 'الإسكندرية' } });
  const nasrCity = await prisma.city.findFirst({ where: { name: 'مدينة نصر', governorateId: cairo?.id } });
  const mountAmreya = await prisma.city.findFirst({ where: { name: 'العامرية', governorateId: alex?.id } });

  if (!cairo || !alex || !nasrCity) {
    console.error('❌ Essential locations not found in DB. Run seed first.');
    return;
  }

  console.log(`📍 Found Locations: Cairo(id:${cairo.id}), Alex(id:${alex.id}), Nasr City(id:${nasrCity.id})`);

  // 2. Register Client
  const clientEmail = `client_geo_${Date.now()}@test.com`;
  const client = await prisma.user.create({
    data: {
      fullName: 'عميل القاهرة الجديد',
      email: clientEmail,
      password: 'password123',
      role: 'CLIENT',
      governorateId: cairo.id,
      cityId: nasrCity.id,
      isActive: true
    }
  });
  console.log('✅ Client created in Cairo/Nasr City');

  // 3. Register Vendors in different locations
  const vendorAlex = await prisma.user.create({
    data: {
      fullName: 'مورد الإسكندرية',
      email: `alex_vendor_${Date.now()}@test.com`,
      password: 'password123',
      role: 'VENDOR',
      governorateId: alex.id,
      cityId: mountAmreya?.id,
      isActive: true
    }
  });

  const vendorCairo = await prisma.user.create({
    data: {
      fullName: 'مورد القاهرة',
      email: `cairo_vendor_${Date.now()}@test.com`,
      password: 'password123',
      role: 'VENDOR',
      governorateId: cairo.id,
      cityId: nasrCity.id,
      isActive: true
    }
  });
  console.log('✅ Registered 2 Vendors: 1 in Alex, 1 in Cairo');

  // Setup vendor categories for both
  const subCat = await prisma.category.findFirst({ where: { parentId: { not: null } } });
  if (subCat) {
    await prisma.vendorCategory.createMany({
       data: [
         { vendorId: vendorAlex.id, categoryId: subCat.id },
         { vendorId: vendorCairo.id, categoryId: subCat.id }
       ]
    });
  }

  // 4. Client Creates Request in Cairo
  console.log('📝 Client is creating a request in Cairo...');
  const request = await prisma.request.create({
    data: {
      clientId: client.id,
      title: 'محاكاة طلب جغرافي',
      description: 'أبحث عن فني قريب في مدينة نصر',
      categoryId: subCat?.id || 1,
      address: 'الحي السابع، مدينة نصر',
      latitude: 30.0444,
      longitude: 31.2357,
      deliveryPhone: '01011111111',
      governorateId: cairo.id,
      cityId: nasrCity.id,
      status: 'OPEN_FOR_BIDDING'
    }
  });
  console.log('✅ Request published in Cairo/Nasr City');

  // 5. TEST SEARCH FILTERING
  console.log('\n🔍 Testing Search Relevance...');

  // Mocking listVendorOpenRequests call via Service because we are in TS script
  const { listVendorOpenRequests: listSvc } = require('../lib/services/requests/list-vendor-open-requests');

  const alexVendorSearchLocal = await listSvc(vendorAlex.id, { governorateId: alex.id });
  console.log(`- Alex Vendor searching in Alex: Found ${alexVendorSearchLocal.length} requests (Expected: 0)`);

  const alexVendorSearchCairo = await listSvc(vendorAlex.id, { governorateId: cairo.id });
  console.log(`- Alex Vendor searching in Cairo: Found ${alexVendorSearchCairo.length} requests (Expected: >=1)`);

  const cairoVendorSearchLocal = await listSvc(vendorCairo.id, { governorateId: cairo.id, cityId: nasrCity.id });
  console.log(`- Cairo Vendor searching in Nasr City: Found ${cairoVendorSearchLocal.length} requests (Expected: 1)`);

  // 6. Complete the cycle with the Local Vendor
  console.log('\n💰 Completing lifecycle with Cairo Vendor...');
  const bid = await prisma.bid.create({
    data: {
      requestId: request.id,
      vendorId: vendorCairo.id,
      netPrice: 250,
      clientPrice: 250,
      status: 'PENDING',
      description: 'عرض صيانة من فني متخصص قريب منك'
    }
  });
  console.log('✅ Cairo Vendor submitted a bid');

  // Accept and Settle
  await acceptOffer(request.id, bid.id);
  console.log('✅ Client accepted Cairo Vendor offer');

  // Settle
  await settleOrder(request.id);
  console.log('✅ Order settled successfully! Money moved to Cairo Vendor.');

  console.log('\n🏁 Geographical Simulation Completed Successfully!');
}

runLocationSimulation()
  .catch((e) => {
    console.error('❌ Simulation Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
