import { PrismaClient } from '../app/generated/prisma';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:pass1234@localhost:5432/shoofly?schema=public",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Starting Standalone Scenario Simulation Seeding (with Adapter)...');

  const password = await bcrypt.hash('password123', 10);

  // 1. Create Admins
  await prisma.user.upsert({
    where: { email: 'admin@shoofly.com' },
    update: {},
    create: {
      email: 'admin@shoofly.com',
      fullName: 'أدمن النظام الرئيسي',
      phone: '01000000000',
      password,
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    }
  });

  // 2. Create Clients
  const clients = await Promise.all([
    prisma.user.upsert({
      where: { email: 'ahmed@gmail.com' },
      update: { walletBalance: 5000 },
      create: { 
        email: 'ahmed@gmail.com', 
        fullName: 'أحمد محمد', 
        phone: '01112223334', 
        password, 
        role: 'CLIENT', 
        isActive: true,
        walletBalance: 5000
      }
    })
  ]);

  // 3. Create Vendors
  const vendors = await Promise.all([
    prisma.user.upsert({
      where: { email: 'vendor1@shoofly.com' },
      update: { verificationStatus: 'APPROVED' },
      create: { 
        email: 'vendor1@shoofly.com', 
        fullName: 'الشركة الهندسية للتكييف', 
        phone: '01223334445', 
        password, 
        role: 'VENDOR', 
        isActive: true, 
        isVerified: true,
        verificationStatus: 'APPROVED',
        latitude: 30.0626, 
        longitude: 31.2497,
        vendorAddress: 'رمسيس، القاهرة'
      }
    })
  ]);

  // 4. Create Riders
  const riders = await Promise.all([
    prisma.user.upsert({
      where: { email: 'rider1@shoofly.com' },
      update: { isActive: true },
      create: { 
        email: 'rider1@shoofly.com', 
        fullName: 'كابتن هاني', 
        phone: '01556667778', 
        password, 
        role: 'DELIVERY', 
        isActive: true, 
        isVerified: true,
        vehicleType: 'MOTORCYCLE'
      }
    })
  ]);

  // 5. Create Category
  const category = await prisma.category.upsert({
    where: { slug: 'ac-repair' },
    update: {},
    create: { name: 'صيانة تكييف', slug: 'ac-repair', type: 'SERVICE', nameAr: 'صيانة تكييف' }
  });

  // 6. Create Request
  const request = await prisma.request.create({
    data: {
      title: 'تصليح تكييف شارب ٣ حصان',
      description: 'التكييف مش بيسقع خالص ومحتاج شحن فريون - تجربة سيستم',
      clientId: clients[0].id,
      categoryId: category.id,
      latitude: 30.0444,
      longitude: 31.2357,
      address: 'وسط البلد، القاهرة',
      deliveryPhone: '01112223334',
      status: 'ORDER_PAID_PENDING_DELIVERY',
      assignedDeliveryAgentId: riders[0].id
    }
  });

  // 7. Create Bid
  const bid = await prisma.bid.create({
    data: {
      requestId: request.id,
      vendorId: vendors[0].id,
      netPrice: 500,
      clientPrice: 575,
      description: 'موجود قطع غيار أصلية وضمان ٣ شهور',
      status: 'ACCEPTED_BY_CLIENT'
    }
  });

  await prisma.request.update({
    where: { id: request.id },
    data: { selectedBidId: bid.id }
  });

  // 8. Tracking
  await prisma.deliveryTracking.createMany({
    data: [
      {
        requestId: request.id,
        status: 'ORDER_PLACED',
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        requestId: request.id,
        status: 'IN_TRANSIT',
        latitude: 30.0626,
        longitude: 31.2497,
        createdAt: new Date(Date.now() - 1800000)
      },
      {
        requestId: request.id,
        status: 'OUT_FOR_DELIVERY',
        latitude: 30.0544,
        longitude: 31.2427,
        createdAt: new Date()
      }
    ]
  });

  console.log('✅ Standalone Simulation Data Seeded with Adapter!');
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
