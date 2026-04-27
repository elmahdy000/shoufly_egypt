import { RequestStatus, TransactionType } from "../app/generated/prisma";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🔥 Starting MEGA Egyptian Seed (Incremental Mode)...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Core Metadata
  const governorates = [
    { name: "القاهرة", cities: ["مدينة نصر", "المعادي", "مصر الجديدة", "شبرا", "حلوان"] },
    { name: "الجيزة", cities: ["الدقي", "المهندسين", "6 أكتوبر", "الهرم", "الشيخ زايد"] },
    { name: "الإسكندرية", cities: ["سموحة", "الرمل", "العجمي", "المنتزه"] },
    { name: "الدقهلية", cities: ["المنصورة", "طلخا", "ميت غمر"] },
  ];

  console.log("📍 Seeding Locations...");
  const govMap = new Map();
  const cityMap = new Map();

  for (const g of governorates) {
    const gov = await prisma.governorate.upsert({
      where: { name: g.name },
      update: {},
      create: { name: g.name, nameAr: g.name }
    });
    govMap.set(g.name, gov.id);

    for (const cityName of g.cities) {
      let city = await prisma.city.findFirst({
        where: { name: cityName, governorateId: gov.id }
      });
      if (!city) {
        city = await prisma.city.create({
          data: { name: cityName, governorateId: gov.id }
        });
      }
      cityMap.set(cityName, city.id);
    }
  }

  // 2. Categories
  console.log("📂 Seeding Complex Categories...");
  const categories = [
    { name: "صيانة أجهزة", sub: ["غسالات", "ثلاجات", "تكييفات", "سخانات"] },
    { name: "إلكترونيات", sub: ["موبايل", "لابتوب", "شاشات", "ألعاب"] },
    { name: "خدمات منزلية", sub: ["سباكة", "كهرباء", "نجارة", "نقاشة"] },
    { name: "سيارات", sub: ["ميكانيكا", "عفشة", "سمكرة", "كهرباء سيارات"] },
  ];

  const subCatIds: number[] = [];
  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name, slug: `mega-${cat.name}` }
    });
    for (const sub of cat.sub) {
      const s = await prisma.category.upsert({
        where: { name: sub },
        update: {},
        create: { name: sub, slug: `mega-${sub}`, parentId: parent.id }
      });
      subCatIds.push(s.id);
    }
  }

  // 3. Detailed Users
  console.log("👥 Seeding 50+ Users...");
  
  // Clients (30)
  const clientIds: number[] = [];
  for (let i = 1; i <= 30; i++) {
    const u = await prisma.user.upsert({
      where: { email: `client.mega${i}@shoofly.com` },
      update: {},
      create: {
        fullName: `عميل مصري رقم ${i}`,
        email: `client.mega${i}@shoofly.com`,
        password: hashedPassword,
        phone: `+2010${10000000 + i}`,
        role: "CLIENT",
        isActive: true,
        walletBalance: Math.floor(Math.random() * 5000)
      }
    });
    clientIds.push(u.id);
  }

  // Vendors (15)
  const vendorIds: number[] = [];
  for (let i = 1; i <= 15; i++) {
    const v = await prisma.user.upsert({
      where: { email: `vendor.mega${i}@shoofly.com` },
      update: {},
      create: {
        fullName: `محل صيانة ${i}`,
        email: `vendor.mega${i}@shoofly.com`,
        password: hashedPassword,
        phone: `+2011${20000000 + i}`,
        role: "VENDOR",
        isActive: true,
        isVerified: true,
        walletBalance: 0
      }
    });
    vendorIds.push(v.id);
    // Link to random category if not already linked
    const existingLink = await prisma.vendorCategory.findFirst({
        where: { vendorId: v.id }
    });
    if (!existingLink) {
        await prisma.vendorCategory.create({
          data: { vendorId: v.id, categoryId: subCatIds[Math.floor(Math.random() * subCatIds.length)] }
        });
    }
  }

  // Raiders (10)
  const riderIds: number[] = [];
  for (let i = 1; i <= 10; i++) {
    const r = await prisma.user.upsert({
      where: { email: `rider.mega${i}@shoofly.com` },
      update: {},
      create: {
        fullName: `كابتن توصيل ${i}`,
        email: `rider.mega${i}@shoofly.com`,
        password: hashedPassword,
        phone: `+2012${30000000 + i}`,
        role: "DELIVERY",
        isActive: true,
        isVerified: true
      }
    });
    riderIds.push(r.id);
  }

  // 4. Requests (50 for now to keep it fast)
  console.log("📦 Seeding 50 Requests...");
  const statuses: RequestStatus[] = ["PENDING_ADMIN_REVISION", "OPEN_FOR_BIDDING", "ORDER_PAID_PENDING_DELIVERY", "CLOSED_SUCCESS"];
  
  for (let i = 1; i <= 150; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
    const catId = subCatIds[Math.floor(Math.random() * subCatIds.length)];
    
    // We create fresh requests every time because they don't have unique strings besides ID
    // but to avoid massive buildup, we only do it if the count is low
    const count = await prisma.request.count();
    if (count > 500) {
        console.log("🛑 Request count high enough, skipping further generation.");
        break;
    }

    const req = await prisma.request.create({
      data: {
        clientId,
        title: `طلب مساعدة فنية رقم ${i} - ${Date.now()}`,
        description: `وصف تفصيلي للمشكلة رقم ${i} بمركز البيانات.`,
        categoryId: catId,
        address: `شارع ${i}`,
        status: status,
        budget: 500 + (i * 10),
        deliveryPhone: `+2010${10000000 + i}`,
        latitude: 30.0 + (Math.random() * 0.1),
        longitude: 31.0 + (Math.random() * 0.1),
        qrCode: status === "ORDER_PAID_PENDING_DELIVERY" ? `MEGA${i}` : null,
        assignedDeliveryAgentId: status === "ORDER_PAID_PENDING_DELIVERY" ? riderIds[i % 10] : null
      }
    });

    // Create Bids
    if (status !== "PENDING_ADMIN_REVISION") {
      const bidCount = Math.min(vendorIds.length, 1 + Math.floor(Math.random() * 3));
      const usedVendorIds = new Set<number>();
      
      for (let b = 0; b < bidCount; b++) {
        let vendorId;
        do {
          vendorId = vendorIds[Math.floor(Math.random() * vendorIds.length)];
        } while (usedVendorIds.has(vendorId));
        usedVendorIds.add(vendorId);

        const isSelected = (status === "ORDER_PAID_PENDING_DELIVERY" || status === "CLOSED_SUCCESS") && b === 0;
        
        const bid = await prisma.bid.create({
          data: {
            requestId: req.id,
            vendorId,
            description: `عرض سعر احترافي رقم ${b}`,
            netPrice: 400 + (i * 5),
            clientPrice: 450 + (i * 5),
            status: isSelected ? "ACCEPTED_BY_CLIENT" : "PENDING"
          }
        });

        if (isSelected) {
          await prisma.request.update({
            where: { id: req.id },
            data: { selectedBidId: bid.id }
          });
          
          if (status === "CLOSED_SUCCESS") {
            await prisma.transaction.create({
              data: {
                userId: vendorId,
                amount: 400 + (i * 5),
                type: "VENDOR_PAYOUT",
                requestId: req.id,
                description: `تسوية عادلة`
              }
            });
          }
        }
      }
    }
  }

  console.log("💸 Mega Seed (Incremental) Completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
