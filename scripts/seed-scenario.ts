import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Scenario Simulation Seeding...');

  const password = await bcrypt.hash('password123', 10);

  // 1. Create Admins
  const admin = await prisma.user.upsert({
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
      update: {},
      create: { email: 'ahmed@gmail.com', fullName: 'أحمد محمد', phone: '01112223334', password, role: 'CLIENT', isActive: true }
    }),
    prisma.user.upsert({
      where: { email: 'sara@gmail.com' },
      update: {},
      create: { email: 'sara@gmail.com', fullName: 'سارة علي', phone: '01112223335', password, role: 'CLIENT', isActive: true }
    })
  ]);

  // 3. Create Vendors (with locations)
  const vendors = await Promise.all([
    prisma.user.upsert({
      where: { email: 'vendor1@shoofly.com' },
      update: {
        verificationStatus: 'APPROVED'
      },
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
    }),
    prisma.user.upsert({
      where: { email: 'vendor2@shoofly.com' },
      update: {},
      create: { 
        email: 'vendor2@shoofly.com', 
        fullName: 'مركز صيانة الوفاء', 
        phone: '01223334446', 
        password, 
        role: 'VENDOR', 
        isActive: true, 
        isVerified: true,
        verificationStatus: 'APPROVED',
        latitude: 30.0131, 
        longitude: 31.2089,
        vendorAddress: 'المعادي، القاهرة'
      }
    })
  ]);

  // 4. Create Delivery Agents (Riders)
  const riders = await Promise.all([
    prisma.user.upsert({
      where: { email: 'rider1@shoofly.com' },
      update: {},
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

  // 5. Create Categories
  const category = await prisma.category.upsert({
    where: { slug: 'ac-repair' },
    update: {},
    create: { name: 'صيانة تكييف', slug: 'ac-repair', type: 'SERVICE', nameAr: 'صيانة تكييف' }
  });

  // 6. Create Scenario: A Paid Request being delivered
  const request = await prisma.request.create({
    data: {
      title: 'تصليح تكييف شارب ٣ حصان',
      description: 'التكييف مش بيسقع خالص ومحتاج شحن فريون',
      clientId: clients[0].id,
      categoryId: category.id,
      latitude: 30.0444,
      longitude: 31.2357, // Tahrir Square
      address: 'وسط البلد، القاهرة',
      deliveryPhone: '01112223334',
      status: 'ORDER_PAID_PENDING_DELIVERY',
      assignedDeliveryAgentId: riders[0].id
    }
  });

  // 7. Add Bids for this request
  const bid = await prisma.bid.create({
    data: {
      requestId: request.id,
      vendorId: vendors[0].id,
      netPrice: 500,
      clientPrice: 575, // 15% commission
      description: 'موجود قطع غيار أصلية وضمان ٣ شهور',
      status: 'ACCEPTED_BY_CLIENT'
    }
  });

  await prisma.request.update({
    where: { id: request.id },
    data: { selectedBidId: bid.id }
  });

  // 8. Add Live Tracking Simulation (The Rider is moving!)
  await prisma.deliveryTracking.createMany({
    data: [
      {
        requestId: request.id,
        status: 'ORDER_PLACED',
        createdAt: new Date(Date.now() - 60 * 60 * 1000)
      },
      {
        requestId: request.id,
        status: 'IN_TRANSIT',
        latitude: 30.0626, // Starting from Vendor 1
        longitude: 31.2497,
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        requestId: request.id,
        status: 'OUT_FOR_DELIVERY',
        latitude: 30.0544, // Halfway to Client
        longitude: 31.2427,
        createdAt: new Date()
      }
    ]
  });

  // 9. Add another open request for map variety
  await prisma.request.create({
    data: {
      title: 'طلب قطع غيار سيارة لادا',
      description: 'محتاج تيل فرامل ومساعدين خلفي',
      clientId: clients[1].id,
      categoryId: category.id,
      latitude: 30.1000,
      longitude: 31.3000,
      address: 'مدينة نصر، القاهرة',
      deliveryPhone: '01112223335',
      status: 'OPEN_FOR_BIDDING'
    }
  });

  console.log('✅ Simulation Data Seeded Successfully!');
  console.log('--- Credentials ---');
  console.log('Admin: admin@shoofly.com / password123');
  console.log('Client: ahmed@gmail.com / password123');
  console.log('Vendor: vendor1@shoofly.com / password123');
  console.log('Rider: rider1@shoofly.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
