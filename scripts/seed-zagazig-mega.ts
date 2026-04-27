import { PrismaClient } from '../app/generated/prisma';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:pass1234@localhost:5432/shoofly?schema=public",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Zagazig Core Coordinates
const ZAG_LAT = 30.5877;
const ZAG_LNG = 31.5020;

async function main() {
  console.log('🏗️ Starting MEGA Seeding for Zagazig (الزقازيق)...');

  const password = await bcrypt.hash('password123', 10);

  // 1. Ensure Zagazig exists in City/Governorate
  const sharqia = await prisma.governorate.upsert({
    where: { name: 'الشرقية' },
    update: {},
    create: { name: 'الشرقية' }
  });

  const zagazig = await prisma.city.findFirst({
    where: { name: 'الزقازيق', governorateId: sharqia.id },
  }) ?? await prisma.city.create({
    data: { name: 'الزقازيق', governorateId: sharqia.id },
  });

  // 2. Create Bulk Clients in Zagazig
  console.log('👥 Seeding Clients...');
  const clients = await Promise.all([
    { name: 'محمد صبحي', email: 'sobhy@gmail.com', lat: 30.5880, lng: 31.5010 },
    { name: 'هدى فاروق', email: 'hoda@gmail.com', lat: 30.5920, lng: 31.5100 },
    { name: 'ياسين كمال', email: 'yassin@gmail.com', lat: 30.5800, lng: 31.4900 },
    { name: 'أمل إبراهيم', email: 'amal@gmail.com', lat: 30.6000, lng: 31.5200 },
  ].map(u => prisma.user.upsert({
    where: { email: u.email },
    update: { latitude: u.lat, longitude: u.lng, cityId: zagazig.id },
    create: { 
      email: u.email, 
      fullName: u.name, 
      password, 
      role: 'CLIENT', 
      phone: `010${Math.floor(10000000 + Math.random() * 90000000)}`,
      latitude: u.lat, 
      longitude: u.lng,
      cityId: zagazig.id,
      isActive: true,
      walletBalance: 2000
    }
  })));

  // 3. Create Bulk Vendors in Zagazig
  console.log('🏪 Seeding Vendors...');
  const vendors = await Promise.all([
    { name: 'مركز صيانة النور', email: 'noor@vendor.com', lat: 30.5850, lng: 31.5050, addr: 'شارع المحافظة، الزقازيق' },
    { name: 'مودرن هوم للأجهزة', email: 'modern@vendor.com', lat: 30.5900, lng: 31.5150, addr: 'حي الزهور، الزقازيق' },
    { name: 'المصري لقطع الغيار', email: 'masry@vendor.com', lat: 30.5750, lng: 31.4850, addr: 'شارع الجلاء، الزقازيق' },
  ].map(v => prisma.user.upsert({
    where: { email: v.email },
    update: { verificationStatus: 'APPROVED', isVerified: true, latitude: v.lat, longitude: v.lng },
    create: {
      email: v.email,
      fullName: v.name,
      password,
      role: 'VENDOR',
      phone: `012${Math.floor(10000000 + Math.random() * 90000000)}`,
      latitude: v.lat,
      longitude: v.lng,
      vendorAddress: v.addr,
      isVerified: true,
      verificationStatus: 'APPROVED',
      isActive: true,
      cityId: zagazig.id
    }
  })));

  // 4. Create Bulk Riders in Zagazig
  console.log('🏍️ Seeding Riders...');
  const riders = await Promise.all([
    { name: 'كابتن عبده', email: 'abdo@rider.com' },
    { name: 'كابتن سيد', email: 'sayed@rider.com' },
    { name: 'كابتن محمود', email: 'mah@rider.com' },
  ].map(r => prisma.user.upsert({
    where: { email: r.email },
    update: { isActive: true },
    create: {
      email: r.email,
      fullName: r.name,
      password,
      role: 'DELIVERY',
      phone: `015${Math.floor(10000000 + Math.random() * 90000000)}`,
      isActive: true,
      isVerified: true,
      vehicleType: 'MOTORCYCLE'
    }
  })));

  // 5. Create Categories & Brands
  console.log('📦 Seeding Categories & Brands...');
  const cats = await Promise.all([
    prisma.category.upsert({ where: { slug: 'electronics' }, update: {}, create: { name: 'إلكترونيات', nameAr: 'إلكترونيات', slug: 'electronics', type: 'PRODUCT' } }),
    prisma.category.upsert({ where: { slug: 'appliances' }, update: {}, create: { name: 'أجهزة منزلية', nameAr: 'أجهزة منزلية', slug: 'appliances', type: 'PRODUCT' } }),
    prisma.category.upsert({ where: { slug: 'plumbing' }, update: {}, create: { name: 'سباكة', nameAr: 'سباكة', slug: 'plumbing', type: 'SERVICE' } }),
  ]);

  const brands = await Promise.all([
    prisma.brand.upsert({ where: { slug: 'samsung' }, update: {}, create: { name: 'سامسونج', slug: 'samsung', type: 'PRODUCT' } }),
    prisma.brand.upsert({ where: { slug: 'lg' }, update: {}, create: { name: 'إل جي', slug: 'lg', type: 'PRODUCT' } }),
  ]);

  // 6. Create Active Scenario Requests in Zagazig
  console.log('🛰️ Creating Live Scenarios...');

  // Scenario 1: Request Out for Delivery
  const req1 = await prisma.request.create({
    data: {
      title: 'محتاج غسالة إل جي ٧ كيلو',
      description: 'أحسن سعر لغسالة إل جي سيلفر في الزقازيق',
      clientId: clients[0].id,
      categoryId: cats[1].id,
      brandId: brands[1].id,
      latitude: 30.5880,
      longitude: 31.5010,
      address: 'القنايات، الزقازيق',
      deliveryPhone: clients[0].phone!,
      status: 'ORDER_PAID_PENDING_DELIVERY',
      assignedDeliveryAgentId: riders[0].id,
      cityId: zagazig.id
    }
  });

  const bid1 = await prisma.bid.create({
    data: {
      requestId: req1.id,
      vendorId: vendors[1].id,
      netPrice: 12000,
      clientPrice: 13800,
      description: 'موجودة استلام فوري ومعاها ضمان سنة زيادة',
      status: 'ACCEPTED_BY_CLIENT'
    }
  });

  await prisma.request.update({ where: { id: req1.id }, data: { selectedBidId: bid1.id } });

  await prisma.deliveryTracking.createMany({
    data: [
      { requestId: req1.id, status: 'ORDER_PLACED', createdAt: new Date(Date.now() - 7200000) },
      { requestId: req1.id, status: 'IN_TRANSIT', latitude: 30.5900, longitude: 31.5150, createdAt: new Date(Date.now() - 3600000) },
      { requestId: req1.id, status: 'OUT_FOR_DELIVERY', latitude: 30.5890, longitude: 31.5080, createdAt: new Date() },
    ]
  });

  // Scenario 2: Open Request for Bidding
  await prisma.request.create({
    data: {
      title: 'تصليح ماتور مياه ١ حصان',
      description: 'الماتور بيزن ومش بيسحب مياه، محتاج فني يجي حي الزهور',
      clientId: clients[1].id,
      categoryId: cats[2].id,
      latitude: 30.5920,
      longitude: 31.5100,
      address: 'حي الزهور، الزقازيق',
      deliveryPhone: clients[1].phone!,
      status: 'OPEN_FOR_BIDDING',
      cityId: zagazig.id
    }
  });

  // Scenario 3: Request with multiple bids
  const req3 = await prisma.request.create({
    data: {
      title: 'شاحن لابتوب أصلي',
      description: 'محتاج شاحن لابتوب ديل ٦٥ وات',
      clientId: clients[2].id,
      categoryId: cats[0].id,
      latitude: 30.5800,
      longitude: 31.4900,
      address: 'شارع الجلاء، الزقازيق',
      deliveryPhone: clients[2].phone!,
      status: 'BIDS_RECEIVED',
      cityId: zagazig.id
    }
  });

  await prisma.bid.createMany({
    data: [
      { requestId: req3.id, vendorId: vendors[0].id, netPrice: 450, clientPrice: 517, description: 'أصلي ١٠٠٪ مع ضمان شهر', status: 'PENDING' },
      { requestId: req3.id, vendorId: vendors[2].id, netPrice: 400, clientPrice: 460, description: 'كوبي نضيف جداً وشغال ممتاز', status: 'PENDING' },
    ]
  });

  console.log('✅ MEGA Seeding for Zagazig Completed Successfully!');
  console.log('📍 You can now view all activity in Zagazig on the Map.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
