import { RequestStatus, TransactionType } from "../app/generated/prisma";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🚀 Starting Production-Ready Egyptian Seed...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Cleanup (Optional: uncomment if you want a clean slate)
  // console.log("🧹 Cleaning up old data...");
  // await prisma.chatMessage.deleteMany();
  // await prisma.transaction.deleteMany();
  // await prisma.deliveryTracking.deleteMany();
  // await prisma.bid.deleteMany();
  // await prisma.request.deleteMany();
  // await prisma.user.deleteMany();

  // 2. Base Metadata (Governorates & Cities)
  console.log("📍 Seeding Governorates & Cities...");
  const cairo = await prisma.governorate.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "القاهرة" }
  });

  const giza = await prisma.governorate.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: "الجيزة" }
  });

  const nasrCity = await prisma.city.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "مدينة نصر", governorateId: cairo.id }
  });

  const dokki = await prisma.city.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: "الدقي", governorateId: giza.id }
  });

  // 3. User Accounts
  console.log("👥 Seeding Egyptian Users...");
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@shoofly.com" },
    update: {},
    create: {
      fullName: "إدارة شوفلاي",
      email: "admin@shoofly.com",
      password: hashedPassword,
      phone: "+201011111111",
      role: "ADMIN",
      isActive: true,
      isVerified: true,
      walletBalance: 100000
    }
  });

  const client1 = await prisma.user.upsert({
    where: { email: "ahmed@gmail.com" },
    update: {},
    create: {
      fullName: "أحمد المصري",
      email: "ahmed@gmail.com",
      password: hashedPassword,
      phone: "+201020304050",
      role: "CLIENT",
      isActive: true,
      governorateId: cairo.id,
      cityId: nasrCity.id,
      walletBalance: 5000
    }
  });

  const vendor1 = await prisma.user.upsert({
    where: { email: "alex.store@shoofly.com" },
    update: {},
    create: {
      fullName: "أليكس ستور للصيانة",
      email: "alex.store@shoofly.com",
      password: hashedPassword,
      phone: "+201112223334",
      role: "VENDOR",
      isActive: true,
      isVerified: true,
      governorateId: cairo.id,
      cityId: nasrCity.id,
      walletBalance: 2000
    }
  });

  const rider1 = await prisma.user.upsert({
    where: { email: "hani.delivery@shoofly.com" },
    update: {},
    create: {
      fullName: "هاني دليفري",
      email: "hani.delivery@shoofly.com",
      password: hashedPassword,
      phone: "+201212121212",
      role: "DELIVERY",
      isActive: true,
      isVerified: true,
      walletBalance: 500
    }
  });

  // 4. Categories & Brands
  console.log("📂 Seeding Categories...");
  const techParent = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "إلكترونيات", slug: "electronics" }
  });

  const mobileSub = await prisma.category.upsert({
    where: { slug: "mobile-repair" },
    update: {},
    create: { name: "صيانة موبايلات", slug: "mobile-repair", parentId: techParent.id }
  });

  const iphone = await prisma.brand.upsert({
    where: { slug: "iphone" },
    update: {},
    create: { name: "آيفون", slug: "iphone", type: "phone" }
  });

  // Link vendor to category
  await prisma.vendorCategory.upsert({
    where: { vendorId_categoryId: { vendorId: vendor1.id, categoryId: mobileSub.id } },
    update: {},
    create: { vendorId: vendor1.id, categoryId: mobileSub.id }
  });

  // 5. Sample Requests (The Core of Testing)
  console.log("📦 Seeding Sample Requests...");

  // Request 1: Open for bidding
  await prisma.request.create({
    data: {
      clientId: client1.id,
      title: "تغيير شاشة آيفون 13 برو",
      description: "الشاشة فيها كسر طولي ومحتاج شاشة أصلية أو هاي كوبي بضمان.",
      categoryId: mobileSub.id,
      brandId: iphone.id,
      address: "شارع مكرم عبيد، مدينة نصر",
      governorateId: cairo.id,
      cityId: nasrCity.id,
      deliveryPhone: client1.phone!,
      status: "OPEN_FOR_BIDDING",
      latitude: 30.0561,
      longitude: 31.3304,
      budget: 5000,
      bids: {
        create: [
          {
            vendorId: vendor1.id,
            description: "موجود شاشة أصلية خلع توكيل وعليها ضمان 3 شهور.",
            netPrice: 3500,
            clientPrice: 3850,
            status: "PENDING"
          }
        ]
      }
    }
  });

  // Request 2: Paid and Pending Delivery (Ready for Agent Test)
  const paidRequest = await prisma.request.create({
    data: {
      clientId: client1.id,
      title: "شاحن لابتوب Dell أصلي",
      description: "عايز شاحن 65 وات لسن رفيع، ياريت يكون مستعمل أصلي.",
      categoryId: mobileSub.id, // Reusing for simplicity
      address: "ميدان الدقي، الجيزة",
      governorateId: giza.id,
      cityId: dokki.id,
      deliveryPhone: client1.phone!,
      status: "ORDER_PAID_PENDING_DELIVERY",
      latitude: 30.0333,
      longitude: 31.2333,
      qrCode: "123456", // Test code for the agent
      assignedDeliveryAgentId: rider1.id,
      deliveryTracking: {
        create: [
          { status: "ORDER_PLACED", note: "تم الدفع وتأكيد الطلب" },
          { status: "READY_FOR_PICKUP", note: "المورد جهز الطلب وبانتظار السائق" },
          { status: "OUT_FOR_DELIVERY", note: "السائق استلم الطلب وهو في الطريق إليك" }
        ]
      }
    }
  });

  // Request 3: Pending Admin Revision
  await prisma.request.create({
    data: {
      clientId: client1.id,
      title: "إصلاح سخان غاز يونيفرسال",
      description: "السخان بيطلع صوت تكتكة بس مابولعش.",
      categoryId: mobileSub.id,
      address: "حدائق القبة",
      governorateId: cairo.id,
      cityId: nasrCity.id,
      deliveryPhone: client1.phone!,
      status: "PENDING_ADMIN_REVISION",
      latitude: 30.0911,
      longitude: 31.2911,
      notes: "محتاج فني ضروري النهاردة"
    }
  });

  console.log("✅ Seed Completed Successfullly!");
  console.log("Credentials:");
  console.log("- Admin: admin@shoofly.com / password123");
  console.log("- Client: ahmed@gmail.com / password123");
  console.log("- Vendor: alex.store@shoofly.com / password123");
  console.log("- Rider: hani.delivery@shoofly.com / password123 (QR Code for active task: 123456)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
