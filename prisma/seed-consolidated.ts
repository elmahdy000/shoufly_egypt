import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Category structure for seeding
interface CategoryData {
  name: string;
  slug: string;
  type: "SERVICE" | "PRODUCT" | "DIGITAL";
  requiresBrand: boolean;
  brandType?: string;
  subs?: CategoryData[];
}

async function seedDatabase() {
  console.log("🚀 Starting Comprehensive Shoofly Seed...\n");

  try {
    // 1. DELETE ALL DATA (order matters due to foreign keys)
    console.log("🧹 Cleaning database...");
    await prisma.notification.deleteMany({});
    await prisma.complaint.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.deliveryTracking.deleteMany({});
    await prisma.chatMessage.deleteMany({});
    await prisma.withdrawalRequest.deleteMany({});
    await prisma.bid.deleteMany({});
    await prisma.request.deleteMany({});
    await prisma.vendorBrand.deleteMany({});
    await prisma.vendorCategory.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.platformSetting.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.city.deleteMany({});
    await prisma.governorate.deleteMany({});
    console.log("✅ Database cleaned\n");

    // 2. CREATE PLATFORM SETTINGS
    console.log("⚙️ Creating Platform Settings...");
    const settings = await prisma.platformSetting.create({
      data: {
        commissionPercent: 15,
        minVendorMatchCount: 3,
        initialRadiusKm: 5,
        maxRadiusKm: 50,
        radiusExpansionStepKm: 5,
      },
    });
    console.log("✅ Platform Settings Created\n");

    // 3. SEED LOCATIONS (Governorates & Cities)
    console.log("📍 Seeding Locations...");
    const governoratesData = [
      {
        name: "القاهرة",
        arabicName: "القاهرة",
        cities: ["القاهرة", "مصر الجديدة", "الزمالك", "جاردن سيتي"],
      },
      {
        name: "الجيزة",
        arabicName: "الجيزة",
        cities: ["الجيزة", "6 أكتوبر", "الشيخ زايد", "إمبابة"],
      },
      {
        name: "الإسكندرية",
        arabicName: "الإسكندرية",
        cities: ["الإسكندرية", "ستانلي", "سيدي بشر"],
      },
      {
        name: "المنوفية",
        arabicName: "المنوفية",
        cities: ["شبين الكوم", "قويسنا", "تلا"],
      },
      {
        name: "البحيرة",
        arabicName: "البحيرة",
        cities: ["دمنهور", "كفر الدوار", "رشيد"],
      },
    ];

    const governoratesMap = new Map<string, number>();

    for (const govData of governoratesData) {
      const gov = await prisma.governorate.create({
        data: {
          name: govData.arabicName,
        },
      });
      governoratesMap.set(govData.name, gov.id);

      for (const cityName of govData.cities) {
        await prisma.city.create({
          data: {
            name: cityName,
            governorateId: gov.id,
          },
        });
      }
    }
    console.log("✅ Locations Seeded\n");

    // 4. SEED CATEGORIES & BRANDS
    console.log("📦 Seeding Categories and Brands...");

    const categories: CategoryData[] = [
      // CARS
      {
        name: "السيارات والمحركات",
        slug: "cars",
        type: "SERVICE",
        requiresBrand: true,
        brandType: "CARS",
        subs: [
          {
            name: "قطع غيار سيارات",
            slug: "car-parts",
            type: "PRODUCT",
            requiresBrand: true,
            brandType: "CARS",
          },
          {
            name: "صيانة ميكانيكا وعمرة",
            slug: "car-repair",
            type: "SERVICE",
            requiresBrand: true,
            brandType: "CARS",
          },
          {
            name: "كهرباء وتكييف سيارات",
            slug: "car-electric",
            type: "SERVICE",
            requiresBrand: true,
            brandType: "CARS",
          },
          {
            name: "كاوتش وبطاريات",
            slug: "tires-batteries",
            type: "PRODUCT",
            requiresBrand: false,
          },
          {
            name: "سمكرة ودهان",
            slug: "car-body-painting",
            type: "SERVICE",
            requiresBrand: false,
          },
          {
            name: "عفشة وهيدروليك",
            slug: "suspension-repair",
            type: "SERVICE",
            requiresBrand: false,
          },
          {
            name: "ونش إنقاذ",
            slug: "car-towing",
            type: "SERVICE",
            requiresBrand: false,
          },
        ],
      },

      // ELECTRONICS
      {
        name: "الإلكترونيات والموبايل",
        slug: "electronics",
        type: "SERVICE",
        requiresBrand: false,
        subs: [
          {
            name: "صيانة موبايلات",
            slug: "mobile-repair",
            type: "SERVICE",
            requiresBrand: true,
            brandType: "MOBILES",
          },
          {
            name: "صيانة لابتوب وكمبيوتر",
            slug: "laptop-repair",
            type: "SERVICE",
            requiresBrand: true,
            brandType: "LAPTOPS",
          },
          {
            name: "بلاي ستيشن وألعاب",
            slug: "gaming-services",
            type: "SERVICE",
            requiresBrand: true,
            brandType: "GAMING",
          },
          {
            name: "صيانة شاشات وتلفزيون",
            slug: "tv-screens-repair",
            type: "SERVICE",
            requiresBrand: true,
            brandType: "APPLIANCES",
          },
        ],
      },

      // HOME APPLIANCES
      {
        name: "الأجهزة المنزلية",
        slug: "home-appliances",
        type: "SERVICE",
        requiresBrand: false,
        subs: [
          {
            name: "ثلاجات وفريزر",
            slug: "fridge-repair",
            type: "SERVICE",
            requiresBrand: true,
            brandType: "APPLIANCES",
          },
          {
            name: "غسالات ملابس",
            slug: "washer-repair",
            type: "SERVICE",
            requiresBrand: true,
            brandType: "APPLIANCES",
          },
          {
            name: "بوتاجازات وأفران",
            slug: "stove-repair",
            type: "SERVICE",
            requiresBrand: true,
            brandType: "APPLIANCES",
          },
          {
            name: "سخانات مياه",
            slug: "heater-repair",
            type: "SERVICE",
            requiresBrand: true,
            brandType: "APPLIANCES",
          },
          {
            name: "تكييف وتبريد",
            slug: "ac-repairing",
            type: "SERVICE",
            requiresBrand: true,
            brandType: "APPLIANCES",
          },
        ],
      },

      // HOME SERVICES
      {
        name: "المنزل والتشطيبات",
        slug: "home-maintenance",
        type: "SERVICE",
        requiresBrand: false,
        subs: [
          {
            name: "سباكة وأعمال صحية",
            slug: "plumbing",
            type: "SERVICE",
            requiresBrand: false,
          },
          {
            name: "كهرباء منازل",
            slug: "home-electricity",
            type: "SERVICE",
            requiresBrand: false,
          },
          {
            name: "نجارة باب وشباك",
            slug: "carpentry",
            type: "SERVICE",
            requiresBrand: false,
          },
          {
            name: "نقاشة ودهانات",
            slug: "painting",
            type: "SERVICE",
            requiresBrand: false,
          },
          {
            name: "ألوميتال وزجاج",
            slug: "alumital",
            type: "SERVICE",
            requiresBrand: false,
          },
        ],
      },

      // BEAUTY & HEALTH
      {
        name: "الجمال والصحة",
        slug: "beauty-health",
        type: "SERVICE",
        requiresBrand: false,
        subs: [
          {
            name: "صالون حلاقة رجالي",
            slug: "barber",
            type: "SERVICE",
            requiresBrand: false,
          },
          {
            name: "تجميل للنساء",
            slug: "womens-beauty",
            type: "SERVICE",
            requiresBrand: false,
          },
          {
            name: "جيم واللياقة البدنية",
            slug: "gym-fitness",
            type: "SERVICE",
            requiresBrand: false,
          },
        ],
      },

      // PHARMACY & MEDICAL
      {
        name: "الصيدليات والأدوية",
        slug: "pharmacy",
        type: "PRODUCT",
        requiresBrand: false,
        subs: [
          {
            name: "أدوية عامة",
            slug: "general-medicines",
            type: "PRODUCT",
            requiresBrand: false,
          },
          {
            name: "فيتامينات ومكملات",
            slug: "vitamins-supplements",
            type: "PRODUCT",
            requiresBrand: false,
          },
        ],
      },

      // EDUCATION & TRAINING
      {
        name: "التعليم والتدريب",
        slug: "education",
        type: "SERVICE",
        requiresBrand: false,
        subs: [
          {
            name: "دروس خصوصية",
            slug: "tuition",
            type: "SERVICE",
            requiresBrand: false,
          },
          {
            name: "دورات تدريبية",
            slug: "courses",
            type: "SERVICE",
            requiresBrand: false,
          },
        ],
      },

      // PETS & ANIMALS
      {
        name: "الحيوانات الأليفة",
        slug: "pets",
        type: "SERVICE",
        requiresBrand: false,
        subs: [
          {
            name: "عيادة بيطرية",
            slug: "veterinary",
            type: "SERVICE",
            requiresBrand: false,
          },
          {
            name: "حلاقة حيوانات",
            slug: "pet-grooming",
            type: "SERVICE",
            requiresBrand: false,
          },
        ],
      },
    ];

    // Recursive function to create categories
    async function createCategoriesRecursive(
      items: CategoryData[],
      parentId: number | null = null
    ): Promise<void> {
      for (const item of items) {
        // Check if category already exists by slug (to prevent duplicates)
        const existingCategory = await prisma.category.findUnique({
          where: { slug: item.slug },
        });

        let category;
        if (existingCategory) {
          // Update if exists
          category = await prisma.category.update({
            where: { id: existingCategory.id },
            data: {
              name: item.name,
              type: item.type,
              requiresBrand: item.requiresBrand,
              brandType: item.brandType || null,
              parentId,
            },
          });
        } else {
          // Create if doesn't exist
          category = await prisma.category.create({
            data: {
              name: item.name,
              slug: item.slug,
              type: item.type,
              requiresBrand: item.requiresBrand,
              brandType: item.brandType || null,
              parentId,
            },
          });
        }

        // Recursively create subcategories
        if (item.subs && item.subs.length > 0) {
          await createCategoriesRecursive(item.subs, category.id);
        }
      }
    }

    await createCategoriesRecursive(categories);
    console.log("✅ Categories Seeded\n");

    // 5. SEED BRANDS
    console.log("🏷️ Seeding Brands...");
    const brandData = [
      { name: "Toyota", type: "CARS" },
      { name: "Hyundai", type: "CARS" },
      { name: "Kia", type: "CARS" },
      { name: "Fiat", type: "CARS" },
      { name: "Nissan", type: "CARS" },
      { name: "Mercedes", type: "CARS" },
      { name: "BMW", type: "CARS" },
      { name: "Chery", type: "CARS" },
      { name: "MG", type: "CARS" },
      { name: "Renault", type: "CARS" },
      { name: "Mitsubishi", type: "CARS" },
      { name: "Skoda", type: "CARS" },

      { name: "iPhone", type: "MOBILES" },
      { name: "Samsung", type: "MOBILES" },
      { name: "Xiaomi", type: "MOBILES" },
      { name: "Oppo", type: "MOBILES" },
      { name: "Realme", type: "MOBILES" },
      { name: "Huawei", type: "MOBILES" },
      { name: "Infinix", type: "MOBILES" },

      { name: "Toshiba", type: "APPLIANCES" },
      { name: "Sharp", type: "APPLIANCES" },
      { name: "Fresh", type: "APPLIANCES" },
      { name: "Zanussi", type: "APPLIANCES" },
      { name: "LG", type: "APPLIANCES" },
      { name: "Kiriazi", type: "APPLIANCES" },
      { name: "Unionaire", type: "APPLIANCES" },
      { name: "Beko", type: "APPLIANCES" },
      { name: "Tornado", type: "APPLIANCES" },

      { name: "Dell", type: "LAPTOPS" },
      { name: "HP", type: "LAPTOPS" },
      { name: "Lenovo", type: "LAPTOPS" },
      { name: "ASUS", type: "LAPTOPS" },
      { name: "Apple Mac", type: "LAPTOPS" },
      { name: "Acer", type: "LAPTOPS" },

      { name: "PlayStation", type: "GAMING" },
      { name: "Xbox", type: "GAMING" },
      { name: "Nintendo", type: "GAMING" },
    ];

    for (const brand of brandData) {
      const slug = `${brand.type.toLowerCase()}-${brand.name.toLowerCase().replace(/\s+/g, "-")}`;

      await prisma.brand.upsert({
        where: { slug },
        update: { name: brand.name },
        create: {
          name: brand.name,
          slug,
          type: brand.type,
        },
      });
    }
    console.log("✅ Brands Seeded\n");

    // 6. SEED USERS
    console.log("👥 Seeding Users...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    const cairoGovId = governoratesMap.get("القاهرة") || 1;

    // Admin
    const admin = await prisma.user.create({
      data: {
        fullName: "أحمد محمد - Admin",
        email: "admin@shoofly.com",
        password: hashedPassword,
        phone: "01000000000",
        role: "ADMIN",
        isActive: true,
        isVerified: true,
        governorateId: cairoGovId,
      },
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Clients
    const clients = [];
    for (let i = 1; i <= 3; i++) {
      const client = await prisma.user.create({
        data: {
          fullName: `عميل ${i}`,
          email: `client${i}@shoofly.com`,
          password: hashedPassword,
          phone: `0100000000${i}`,
          role: "CLIENT",
          isActive: true,
          isVerified: true,
          governorateId: cairoGovId,
          walletBalance: 5000,
        },
      });
      clients.push(client);
      console.log(`✅ Client created: ${client.email}`);
    }

    // Vendors
    const vendors = [];
    for (let i = 1; i <= 5; i++) {
      const vendor = await prisma.user.create({
        data: {
          fullName: `بائع ${i}`,
          email: `vendor${i}@shoofly.com`,
          password: hashedPassword,
          phone: `0100000001${i}`,
          role: "VENDOR",
          isActive: true,
          isVerified: true,
          governorateId: cairoGovId,
          walletBalance: 0,
        },
      });
      vendors.push(vendor);
      console.log(`✅ Vendor created: ${vendor.email}`);
    }

    // Delivery Agents
    const deliveryAgents = [];
    for (let i = 1; i <= 2; i++) {
      const agent = await prisma.user.create({
        data: {
          fullName: `عامل توصيل ${i}`,
          email: `delivery${i}@shoofly.com`,
          password: hashedPassword,
          phone: `0100000002${i}`,
          role: "DELIVERY",
          isActive: true,
          isVerified: true,
          governorateId: cairoGovId,
          walletBalance: 0,
        },
      });
      deliveryAgents.push(agent);
      console.log(`✅ Delivery Agent created: ${agent.email}`);
    }
    console.log();

    // 7. ASSIGN VENDOR CATEGORIES & BRANDS
    console.log("🎯 Assigning Vendor Specializations...");
    const carRepairCat = await prisma.category.findUnique({
      where: { slug: "car-repair" },
    });
    const mobileRepairCat = await prisma.category.findUnique({
      where: { slug: "mobile-repair" },
    });

    if (carRepairCat && vendors[0]) {
      await prisma.vendorCategory.create({
        data: {
          userId: vendors[0].id,
          categoryId: carRepairCat.id,
        },
      });
      console.log(`✅ Vendor 1 assigned to Car Repair`);
    }

    if (mobileRepairCat && vendors[1]) {
      await prisma.vendorCategory.create({
        data: {
          userId: vendors[1].id,
          categoryId: mobileRepairCat.id,
        },
      });
      console.log(`✅ Vendor 2 assigned to Mobile Repair`);
    }
    console.log();

    // 8. SUCCESS MESSAGE
    console.log("✨ ============================================");
    console.log("✨ DATABASE SEEDING COMPLETED SUCCESSFULLY! ✨");
    console.log("✨ ============================================\n");
    console.log("📊 Summary:");
    console.log(`   ✅ Platform Settings: 1`);
    console.log(`   ✅ Governorates: ${governoratesData.length}`);
    console.log(`   ✅ Cities: ${governoratesData.reduce((sum, g) => sum + g.cities.length, 0)}`);
    console.log(`   ✅ Categories (hierarchical): ${categories.length} main + subcategories`);
    console.log(`   ✅ Brands: ${brandData.length}`);
    console.log(`   ✅ Users: 1 Admin + 3 Clients + 5 Vendors + 2 Delivery Agents`);
    console.log("\n🔑 Login Credentials:");
    console.log("   Admin: admin@shoofly.com / password123");
    console.log("   Client 1: client1@shoofly.com / password123");
    console.log("   Vendor 1: vendor1@shoofly.com / password123");
    console.log("   Delivery 1: delivery1@shoofly.com / password123\n");

  } catch (error) {
    console.error("❌ Seeding Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Run the seed
seedDatabase()
  .then(() => {
    console.log("✅ Seed script completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal Error:", error);
    process.exit(1);
  });
