// This file is now consolidated in seed-consolidated.ts
// To maintain backward compatibility, we import and run it here

import { prisma } from "@/lib/prisma";
import "./seed-consolidated";
import bcrypt from "bcryptjs";

async function main() {
  // 1. Create Admin User
  console.log("👤 Creating Admin User...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const admin = await prisma.user.create({
    data: {
      fullName: "مسؤول شوفلاي",
      email: "admin@shoofly.com",
      password: hashedPassword,
      phone: "+201011111111",
      role: "ADMIN",
      isActive: true,
      isVerified: true,
      walletBalance: 50000,
    },
  });

  // 4. Create Users - Clients
  console.log("👥 Creating Clients...");
  const clients = await Promise.all([
    prisma.user.create({
      data: {
        fullName: "محمد علي",
        email: "client1@shoofly.com",
        password: hashedPassword,
        phone: "+201012345678",
        role: "CLIENT",
        isActive: true,
        isVerified: true,
        walletBalance: 8500,
      },
    }),
    prisma.user.create({
      data: {
        fullName: "سارة أحمد",
        email: "client2@shoofly.com",
        password: hashedPassword,
        phone: "+201023456789",
        role: "CLIENT",
        isActive: true,
        isVerified: true,
        walletBalance: 12000,
      },
    }),
    prisma.user.create({
      data: {
        fullName: "خالد محمود",
        email: "client3@shoofly.com",
        password: hashedPassword,
        phone: "+201034567890",
        role: "CLIENT",
        isActive: true,
        walletBalance: 3000,
      },
    }),
    prisma.user.create({
      data: {
        fullName: "فاطمة حسن",
        email: "client4@shoofly.com",
        password: hashedPassword,
        phone: "+201045678901",
        role: "CLIENT",
        isActive: true,
        isVerified: false,
        walletBalance: 5500,
      },
    }),
  ]);

  // 5. Create Users - Vendors
  console.log("🏪 Creating Vendors...");
  const vendors = await Promise.all([
    prisma.user.create({
      data: {
        fullName: "شركة التقنية المتقدمة",
        email: "vendor1@shoofly.com",
        password: hashedPassword,
        phone: "+201055555551",
        role: "VENDOR",
        isActive: true,
        isVerified: true,
        walletBalance: 25000,
      },
    }),
    prisma.user.create({
      data: {
        fullName: "أحمد للصيانة",
        email: "vendor2@shoofly.com",
        password: hashedPassword,
        phone: "+201055555552",
        role: "VENDOR",
        isActive: true,
        isVerified: true,
        walletBalance: 15000,
      },
    }),
    prisma.user.create({
      data: {
        fullName: "محمد للخدمات المنزلية",
        email: "vendor3@shoofly.com",
        password: hashedPassword,
        phone: "+201055555553",
        role: "VENDOR",
        isActive: true,
        isVerified: false, // Pending verification
        walletBalance: 8000,
      },
    }),
    prisma.user.create({
      data: {
        fullName: "فني الكهرباء المحترف",
        email: "vendor4@shoofly.com",
        password: hashedPassword,
        phone: "+201055555554",
        role: "VENDOR",
        isActive: true,
        isVerified: true,
        walletBalance: 18000,
      },
    }),
    prisma.user.create({
      data: {
        fullName: "سباك المهندسين",
        email: "vendor5@shoofly.com",
        password: hashedPassword,
        phone: "+201055555555",
        role: "VENDOR",
        isActive: true,
        isVerified: false, // Pending verification
        walletBalance: 9500,
      },
    }),
    // 6th vendor - Auto parts specialist
    prisma.user.create({
      data: {
        fullName: "قطع غيار السيارات العربي",
        email: "vendor6@shoofly.com",
        password: hashedPassword,
        phone: "+201055555556",
        role: "VENDOR",
        isActive: true,
        isVerified: true,
        walletBalance: 22000,
      },
    }),
  ]);

  // 6. Create Users - Delivery Agents
  console.log("🚚 Creating Delivery Agents...");
  const riders = await Promise.all([
    prisma.user.create({
      data: {
        fullName: "محمد السائق",
        email: "rider1@shoofly.com",
        password: hashedPassword,
        phone: "+201066666661",
        role: "DELIVERY",
        isActive: true,
        isVerified: true,
        walletBalance: 1200,
      },
    }),
    prisma.user.create({
      data: {
        fullName: "أحمد مندوب التوصيل",
        email: "rider2@shoofly.com",
        password: hashedPassword,
        phone: "+201066666662",
        role: "DELIVERY",
        isActive: true,
        isVerified: true,
        walletBalance: 800,
      },
    }),
    prisma.user.create({
      data: {
        fullName: "علي سائق الدليفري",
        email: "rider3@shoofly.com",
        password: hashedPassword,
        phone: "+201066666663",
        role: "DELIVERY",
        isActive: true,
        isVerified: true,
        walletBalance: 1500,
      },
    }),
  ]);

  // 7. Create Categories - Comprehensive coverage of Egyptian services and products
  console.log("📂 Creating Comprehensive Categories...");

  // 1. خدمات تكنولوجية وإلكترونيات
  const techCategory = await prisma.category.create({
    data: {
      name: "خدمات تكنولوجية وإلكترونيات",
      slug: "tech-electronics",
      subcategories: {
        create: [
          { name: "صيانة هواتف محمولة", slug: "mobile-repair" },
          { name: "صيانة لابتوب وكمبيوتر", slug: "laptop-repair" },
          { name: "صيانة تابلت وآيباد", slug: "tablet-repair" },
          { name: "صيانة شاشات و TVs", slug: "tv-repair" },
          { name: "تركيب كاميرات مراقبة", slug: "cctv-install" },
          { name: "صيانة أجهزة منزلية", slug: "appliances-repair" },
          { name: "برمجة وتطوير", slug: "programming" },
          { name: "تصميم جرافيك", slug: "graphic-design" },
          { name: "صيانة طابعات و scanners", slug: "printer-repair" },
          { name: "تركيب شبكات و_router", slug: "networking" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 2. خدمات منزلية
  const homeCategory = await prisma.category.create({
    data: {
      name: "خدمات منزلية",
      slug: "home-services",
      subcategories: {
        create: [
          { name: "سباكة ومواسير", slug: "plumbing" },
          { name: "كهرباء وأفياش", slug: "electrical" },
          { name: "نجارة وبواب", slug: "carpentry" },
          { name: "تنظيف منازل", slug: "home-cleaning" },
          { name: "تنظيف سجاد وموكيت", slug: "carpet-cleaning" },
          { name: "صيانة أثاث", slug: "furniture-repair" },
          { name: "تركيب وصيانة سيراميك", slug: "ceramic-tiles" },
          { name: "دهانات وديكور", slug: "painting-decor" },
          { name: "ألوميتال وشيش", slug: "aluminum-glass" },
          { name: "صيانة أبواب وشبابيك", slug: "doors-windows" },
          { name: "تنسيق حدائق", slug: "gardening" },
          { name: "مكافحة حشرات", slug: "pest-control" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 3. خدمات السيارات
  const autoCategory = await prisma.category.create({
    data: {
      name: "خدمات السيارات",
      slug: "auto-services",
      subcategories: {
        create: [
          { name: "صيانة ميكانيكا", slug: "car-mechanic" },
          { name: "كهرباء سيارات", slug: "car-electric" },
          { name: "تكييف وتبريد", slug: "car-ac" },
          { name: "غسيل وعناية", slug: "car-wash" },
          { name: "تلميع ونانو", slug: "car-polish" },
          { name: "إصلاح كاوتش", slug: "tire-repair" },
          { name: "تركيب زجاج سيارات", slug: "car-glass" },
          { name: "تصليح مساعدين وفرامل", slug: "suspension-brakes" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 4. خدمات صحية وتجميل
  const healthCategory = await prisma.category.create({
    data: {
      name: "خدمات صحية وتجميل",
      slug: "health-beauty",
      subcategories: {
        create: [
          { name: "تمريض منزلي", slug: "home-nursing" },
          { name: "ممرضات كبار السن", slug: "elderly-care" },
          { name: "رعاية أطفال", slug: "child-care" },
          { name: "صالون تجميل منزلي", slug: "home-salon" },
          { name: "حلاقة منزلية", slug: "home-barber" },
          { name: "مساج وعلاج طبيعي", slug: "massage-therapy" },
          { name: "تغذية ودايت", slug: "nutrition-diet" },
          { name: "علاج فيزيائي", slug: "physiotherapy" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 5. خدمات أجهزة كهربائية
  const appliancesCategory = await prisma.category.create({
    data: {
      name: "أجهزة كهربائية ومنزلية",
      slug: "electrical-appliances",
      subcategories: {
        create: [
          { name: "صيانة ثلاجات", slug: "fridge-repair" },
          { name: "صيانة غسالات", slug: "washing-machine-repair" },
          { name: "صيانة تكييف", slug: "air-conditioner-repair" },
          { name: "صيانة ديب فريزر", slug: "freezer-repair" },
          { name: "صيانة بوتاجاز", slug: "stove-repair" },
          { name: "صيانة سخانات", slug: "water-heater-repair" },
          { name: "صيانة مجفف ملابس", slug: "dryer-repair" },
          { name: "صيانة غسالات أطباق", slug: "dishwasher-repair" },
          { name: "صيانة ميكروويف", slug: "microwave-repair" },
          { name: "صيانة خلاطات وكبه", slug: "mixer-repair" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 6. خدمات المطاعم والطعام
  const foodCategory = await prisma.category.create({
    data: {
      name: "مطاعم وخدمات طعام",
      slug: "food-services",
      subcategories: {
        create: [
          { name: "طعام منزلي", slug: "home-cooking" },
          { name: "حلويات منزلية", slug: "home-desserts" },
          { name: "مخبوزات ومعجنات", slug: "home-bakery" },
          { name: "تجهيزات أفراح", slug: "catering-events" },
          { name: "طبخ صحي ودايت", slug: "healthy-food" },
          { name: "شيف منزلي", slug: "private-chef" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 7. خدمات تعليمية
  const educationCategory = await prisma.category.create({
    data: {
      name: "خدمات تعليمية",
      slug: "education-services",
      subcategories: {
        create: [
          { name: "معلم خصوصي - مرحلة ابتدائية", slug: "primary-tutor" },
          { name: "معلم خصوصي - إعدادي وثانوي", slug: "secondary-tutor" },
          { name: "معلم جامعي", slug: "university-tutor" },
          { name: "لغات إنجليزي وفرنسي", slug: "language-tutor" },
          { name: "حاسب آلي وبرمجة", slug: "computer-tutor" },
          { name: "موسيقى وآلات", slug: "music-tutor" },
          { name: "رياضة وفتنس", slug: "fitness-tutor" },
          { name: "فنون رسم", slug: "art-tutor" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 8. خدمات حفلات ومناسبات
  const eventsCategory = await prisma.category.create({
    data: {
      name: "حفلات ومناسبات",
      slug: "events-services",
      subcategories: {
        create: [
          { name: "تنظيم أفراح", slug: "wedding-planning" },
          { name: "تنظيم حفلات أعياد ميلاد", slug: "birthday-planning" },
          { name: "تصوير مناسبات", slug: "event-photography" },
          { name: "دي جي وإضاءة", slug: "dj-lighting" },
          { name: "زينة وبالونات", slug: "decorations" },
          { name: "تأجير كراسي وطاولات", slug: "furniture-rental" },
          { name: "خيام وأفراح شعبية", slug: "tents-events" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 9. منتجات وقطع غيار
  const productsCategory = await prisma.category.create({
    data: {
      name: "منتجات وقطع غيار",
      slug: "products-parts",
      subcategories: {
        create: [
          { name: "قطع غيار موبايلات", slug: "mobile-parts" },
          { name: "قطع غيار لابتوب", slug: "laptop-parts" },
          { name: "اكسسوارات موبايل", slug: "mobile-accessories" },
          { name: "قطع غيار أجهزة منزلية", slug: "appliance-parts" },
          { name: "قطع غيار سيارات", slug: "car-parts" },
          { name: "أدوات كهربائية", slug: "electrical-tools" },
          { name: "أدوات سباكة", slug: "plumbing-tools" },
          { name: "مواد بناء", slug: "building-materials" },
          { name: "دهانات وورق حائط", slug: "paints-wallpaper" },
          { name: "أجهزة كهربائية جديدة", slug: "new-appliances" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 10. خدمات نقل ومواصلات
  const transportCategory = await prisma.category.create({
    data: {
      name: "نقل ومواصلات",
      slug: "transport-services",
      subcategories: {
        create: [
          { name: "نقل أثاث منزلي", slug: "furniture-moving" },
          { name: "نقل عفش داخل المدينة", slug: "local-moving" },
          { name: "نقل بين المحافظات", slug: "intercity-moving" },
          { name: "توصيل طرود وشحن", slug: "parcel-delivery" },
          { name: "توصيل مبردات", slug: "cold-delivery" },
          { name: "ونش رفع أثاث", slug: "furniture-lift" },
          { name: "تأجير سيارات نقل", slug: "truck-rental" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 11. خدمات أعمال ومحترفين
  const businessCategory = await prisma.category.create({
    data: {
      name: "أعمال ومحترفين",
      slug: "business-services",
      subcategories: {
        create: [
          { name: "محاسب ومراجع", slug: "accountant" },
          { name: "محامي واستشارات قانونية", slug: "lawyer" },
          { name: "سكرتارية وإدارة مكتب", slug: "secretary" },
          { name: "تصميم داخلي وديكور", slug: "interior-design" },
          { name: "استشارات هندسية", slug: "engineering-consult" },
          { name: "تسويق إلكتروني", slug: "digital-marketing" },
          { name: "تصوير منتجات", slug: "product-photography" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 12. أمن وسلامة
  const securityCategory = await prisma.category.create({
    data: {
      name: "أمن وسلامة",
      slug: "security-services",
      subcategories: {
        create: [
          { name: "تركيب كاميرات", slug: "cctv-installation" },
          { name: "صيانة أنظمة أمن", slug: "security-maintenance" },
          { name: "تركيب أقفال وكوالين", slug: "locks-installation" },
          { name: "فتح أبواب", slug: "door-unlock" },
          { name: "أجهزة إنذار", slug: "alarm-systems" },
          { name: "أبواب إلكترونية", slug: "electronic-doors" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 13. أعمال يدوية وحرف
  const craftsCategory = await prisma.category.create({
    data: {
      name: "أعمال يدوية وحرف",
      slug: "crafts-handmade",
      subcategories: {
        create: [
          { name: "خياطة وتفصيل ملابس", slug: "tailoring" },
          { name: "تفصيل ستائر", slug: "curtain-sewing" },
          { name: "تنجيد أثاث", slug: "furniture-reupholstery" },
          { name: "تطريز وكروشيه", slug: "embroidery" },
          { name: "صيانة أحذية", slug: "shoe-repair" },
          { name: "صيانة حقائب", slug: "bag-repair" },
          { name: "أعمال خشبية يدوية", slug: "wood-crafts" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 14. حيوانات أليفة
  const petsCategory = await prisma.category.create({
    data: {
      name: "حيوانات أليفة",
      slug: "pet-services",
      subcategories: {
        create: [
          { name: "عيادات بيطرية منزلية", slug: "vet-home" },
          { name: "تصفيف حيوانات", slug: "pet-grooming" },
          { name: "بيع طعام حيوانات", slug: "pet-food" },
          { name: "اكسسوارات حيوانات", slug: "pet-accessories" },
          { name: "استضافة حيوانات", slug: "pet-boarding" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 15. طباعة ونسخ
  const printingCategory = await prisma.category.create({
    data: {
      name: "طباعة ونسخ",
      slug: "printing-services",
      subcategories: {
        create: [
          { name: "طباعة مستندات", slug: "document-printing" },
          { name: "طباعة صور", slug: "photo-printing" },
          { name: "طباعة كروت وفواتير", slug: "cards-printing" },
          { name: "تصوير ونسخ", slug: "photocopy" },
          { name: "تصميم وطباعة بنرات", slug: "banner-printing" },
        ]
      }
    },
    include: { subcategories: true }
  });

  // 8. Create Brands for Specialized Categories
  console.log("🏷️ Creating Brands...");
  
  const brandUpsert = (name: string, slug: string, type: string) =>
    prisma.brand.upsert({
      where: { slug },
      update: {},
      create: { name, slug, type },
    });
  
  // Car Brands
  const carBrands = await Promise.all([
    brandUpsert("تويوتا", "toyota", "car"),
    brandUpsert("هيونداي", "hyundai", "car"),
    brandUpsert("نيسان", "nissan", "car"),
    brandUpsert("شيفروليه", "chevrolet", "car"),
    brandUpsert("مرسيدس بنز", "mercedes", "car"),
    brandUpsert("BMW", "bmw", "car"),
    brandUpsert("فيات", "fiat", "car"),
    brandUpsert("بيجو", "peugeot", "car"),
    brandUpsert("كيا", "kia", "car"),
    brandUpsert("ميتسوبيشي", "mitsubishi", "car"),
    brandUpsert("أوبل", "opel", "car"),
    brandUpsert("سكودا", "skoda", "car"),
    brandUpsert("سيات", "seat", "car"),
    brandUpsert("رينو", "renault", "car"),
  ]);

  // Phone Brands
  const phoneBrands = await Promise.all([
    brandUpsert("آيفون", "iphone", "phone"),
    brandUpsert("سامسونج", "samsung", "phone"),
    brandUpsert("شاومي", "xiaomi", "phone"),
    brandUpsert("أوبو", "oppo", "phone"),
    brandUpsert("ريلمي", "realme", "phone"),
    brandUpsert("هواوي", "huawei", "phone"),
    brandUpsert("هونر", "honor", "phone"),
    brandUpsert("نوكيا", "nokia", "phone"),
    brandUpsert("إنفينيكس", "infinix", "phone"),
    brandUpsert("تكنو", "tecno", "phone"),
  ]);

  // Appliance Brands
  const applianceBrands = await Promise.all([
    brandUpsert("توشيبا", "toshiba", "appliance"),
    brandUpsert("شارب", "sharp", "appliance"),
    brandUpsert("إل جي", "lg", "appliance"),
    brandUpsert("سامسونج أجهزة", "samsung-appliance", "appliance"),
    brandUpsert("يونيون آير", "union-air", "appliance"),
    brandUpsert("كريازي", "kiriazi", "appliance"),
    brandUpsert("فريش", "fresh", "appliance"),
    brandUpsert("وايت ويل", "white-whale", "appliance"),
    brandUpsert("زانوسي", "zanussi", "appliance"),
    brandUpsert("إنديسيت", "indesit", "appliance"),
    brandUpsert("أريستون", "ariston", "appliance"),
    brandUpsert("كاندي", "candy", "appliance"),
  ]);

  // Laptop Brands
  const laptopBrands = await Promise.all([
    brandUpsert("ديل", "dell", "laptop"),
    brandUpsert("HP", "hp", "laptop"),
    brandUpsert("لينوفو", "lenovo", "laptop"),
    brandUpsert("آسوس", "asus", "laptop"),
    brandUpsert("أيسر", "acer", "laptop"),
    brandUpsert("أبل ماك", "macbook", "laptop"),
  ]);

  // 8. Create Vendor-Category Links
  console.log("🔗 Linking Vendors to Categories...");
  await Promise.all([
    // Tech vendors
    prisma.vendorCategory.create({ data: { vendorId: vendors[0].id, categoryId: techCategory.subcategories[0].id } }),
    prisma.vendorCategory.create({ data: { vendorId: vendors[0].id, categoryId: techCategory.subcategories[1].id } }),
    prisma.vendorCategory.create({ data: { vendorId: vendors[1].id, categoryId: techCategory.subcategories[2].id } }),
    // Home services vendors
    prisma.vendorCategory.create({ data: { vendorId: vendors[2].id, categoryId: homeCategory.subcategories[0].id } }),
    prisma.vendorCategory.create({ data: { vendorId: vendors[2].id, categoryId: homeCategory.subcategories[1].id } }),
    prisma.vendorCategory.create({ data: { vendorId: vendors[3].id, categoryId: homeCategory.subcategories[2].id } }),
    prisma.vendorCategory.create({ data: { vendorId: vendors[3].id, categoryId: homeCategory.subcategories[6].id } }),
    prisma.vendorCategory.create({ data: { vendorId: vendors[4].id, categoryId: homeCategory.subcategories[0].id } }),
    prisma.vendorCategory.create({ data: { vendorId: vendors[4].id, categoryId: appliancesCategory.subcategories[0].id } }),
  ]);

  // Link Vendors to Specific Brands (example: car parts vendor)
  console.log("🔗 Linking Vendors to Brands...");
  await Promise.all([
    // Auto vendor (vendors[5]) linked to Toyota, Hyundai, and Nissan
    prisma.vendorBrand.create({ data: { vendorId: vendors[5].id, brandId: carBrands[0].id } }),
    prisma.vendorBrand.create({ data: { vendorId: vendors[5].id, brandId: carBrands[1].id } }),
    prisma.vendorBrand.create({ data: { vendorId: vendors[5].id, brandId: carBrands[2].id } }),
    // Tech vendor linked to iPhone and Samsung
    prisma.vendorBrand.create({ data: { vendorId: vendors[0].id, brandId: phoneBrands[0].id } }),
    prisma.vendorBrand.create({ data: { vendorId: vendors[0].id, brandId: phoneBrands[1].id } }),
    // Appliance vendor linked to Toshiba and Sharp
    prisma.vendorBrand.create({ data: { vendorId: vendors[4].id, brandId: applianceBrands[0].id } }),
    prisma.vendorBrand.create({ data: { vendorId: vendors[4].id, brandId: applianceBrands[1].id } }),
  ]);

  // 9. Create Requests in Various Statuses
  console.log("📦 Creating Requests...");
  
  // Pending Admin Review
  const pendingRequests = await Promise.all([
    prisma.request.create({
      data: {
        clientId: clients[0].id,
        title: "صيانة آيفون 13 شاشة مكسورة",
        description: "الشاشة محطمة بالكامل وأحتاج لتغييرها بقطعة أصلية في أسرع وقت.",
        categoryId: techCategory.subcategories[0].id,
        address: "مدينة نصر، شارع مصطفى النحاس",
        status: "PENDING_ADMIN_REVISION",
        deliveryPhone: clients[0].phone || "+201012345678",
        latitude: 30.0561,
        longitude: 31.3304,
      }
    }),
    prisma.request.create({
      data: {
        clientId: clients[1].id,
        title: "تصليح تسريب مياه في الحمام",
        description: "يوجد تسريب في مواسير الحمام الرئيسية وبحاجة لسباك محترف.",
        categoryId: homeCategory.subcategories[0].id,
        address: "المهندسين، شارع جامعة الدول",
        status: "PENDING_ADMIN_REVISION",
        deliveryPhone: clients[1].phone || "+201023456789",
        latitude: 30.0628,
        longitude: 31.2056,
      }
    }),
    prisma.request.create({
      data: {
        clientId: clients[2].id,
        title: "صيانة تكييف السيارة",
        description: "التكييف لا يعمل بشكل جيد ويحتاج لتعبئة غاز.",
        categoryId: autoCategory.subcategories[2].id,
        address: "التجمع الخامس، شارع التسعين",
        status: "PENDING_ADMIN_REVISION",
        deliveryPhone: clients[2].phone || "+201034567890",
        latitude: 30.0131,
        longitude: 31.4145,
      }
    }),
  ]);

  // Open for Bidding
  const openRequests = await Promise.all([
    prisma.request.create({
      data: {
        clientId: clients[0].id,
        title: "صيانة لابتوب Dell",
        description: "اللابتوب بطيء جداً ويحتاج لتنظيف وصيانة.",
        categoryId: techCategory.subcategories[1].id,
        address: "القاهرة الجديدة، التجمع الأول",
        status: "OPEN_FOR_BIDDING",
        deliveryPhone: clients[0].phone || "+201012345678",
        latitude: 30.0225,
        longitude: 31.4691,
      }
    }),
    prisma.request.create({
      data: {
        clientId: clients[1].id,
        title: "تركيب أفياش جديدة",
        description: "أحتاج تركيب 4 أفياش في غرفة النوم.",
        categoryId: homeCategory.subcategories[1].id,
        address: "6 أكتوبر، الحي السابع",
        status: "OPEN_FOR_BIDDING",
        deliveryPhone: clients[1].phone || "+201023456790",
        latitude: 29.9658,
        longitude: 30.8823,
      }
    }),
  ]);

  // Closed Success
  const closedRequests = await Promise.all([
    prisma.request.create({
      data: {
        clientId: clients[2].id,
        title: "تغيير شاشة سامسونج",
        description: "تم تغيير الشاشة بنجاح.",
        categoryId: techCategory.subcategories[0].id,
        address: "المعادي، شارع 9",
        status: "CLOSED_SUCCESS",
        deliveryPhone: clients[2].phone || "+201034567890",
        latitude: 29.9623,
        longitude: 31.2522,
      }
    }),
    prisma.request.create({
      data: {
        clientId: clients[3].id,
        title: "تصليح كهرباء المطبخ",
        description: "تم إصلاح الكهرباء.",
        categoryId: homeCategory.subcategories[1].id,
        address: "الزمالك، شارع الجزيرة",
        status: "CLOSED_SUCCESS",
        deliveryPhone: clients[3].phone || "+201045678901",
        latitude: 30.0609,
        longitude: 31.2197,
      }
    }),
  ]);

  // Rejected
  await prisma.request.create({
    data: {
      clientId: clients[0].id,
      title: "طلب غير واضح",
      description: "وصف غير كافٍ للطلب.",
      categoryId: techCategory.subcategories[0].id,
      address: "القاهرة",
      status: "REJECTED",
      deliveryPhone: clients[0].phone || "+201012345679",
      latitude: 30.0444,
      longitude: 31.2357,
    }
  });

  // 10. Create Bids
  console.log("💰 Creating Bids...");
  await Promise.all([
    // Bids for open requests
    prisma.bid.create({
      data: {
        requestId: openRequests[0].id,
        vendorId: vendors[0].id,
        description: "يمكنني توفير شاشة أصلية مع ضمان 6 أشهر.",
        netPrice: 2000,
        clientPrice: 2300,
        status: "PENDING",
      }
    }),
    prisma.bid.create({
      data: {
        requestId: openRequests[0].id,
        vendorId: vendors[1].id,
        description: "شاشة درجة أولى بضمان سنة.",
        netPrice: 1800,
        clientPrice: 2100,
        status: "PENDING",
      }
    }),
    prisma.bid.create({
      data: {
        requestId: openRequests[1].id,
        vendorId: vendors[3].id,
        description: "أستطيع الإنتهاء من العمل في يوم واحد.",
        netPrice: 500,
        clientPrice: 600,
        status: "PENDING",
      }
    }),
  ]);

  // 11. Create Transactions (Financial Data)
  console.log("💳 Creating Transactions...");
  await Promise.all([
    // Admin commissions
    prisma.transaction.create({
      data: {
        userId: admin.id,
        amount: 450,
        type: "ADMIN_COMMISSION",
        description: "عمولة من طلب #1",
      }
    }),
    prisma.transaction.create({
      data: {
        userId: admin.id,
        amount: 320,
        type: "ADMIN_COMMISSION",
        description: "عمولة من طلب #2",
      }
    }),
    prisma.transaction.create({
      data: {
        userId: admin.id,
        amount: 280,
        type: "ADMIN_COMMISSION",
        description: "عمولة من طلب #3",
      }
    }),
    prisma.transaction.create({
      data: {
        userId: admin.id,
        amount: 150,
        type: "ADMIN_COMMISSION",
        description: "عمولة من طلب #4",
      }
    }),
    // Vendor payouts
    prisma.transaction.create({
      data: {
        userId: vendors[0].id,
        requestId: closedRequests[0].id,
        amount: 1800,
        type: "VENDOR_PAYOUT",
        description: "دفع للمورد #1",
      }
    }),
    prisma.transaction.create({
      data: {
        userId: vendors[1].id,
        amount: 1200,
        type: "VENDOR_PAYOUT",
        description: "دفع للمورد #2",
      }
    }),
    // Delivery payouts
    prisma.transaction.create({
      data: {
        userId: riders[0].id,
        amount: 50,
        type: "DELIVERY_PAYOUT",
        description: "دفع للمندوب #1",
      }
    }),
    // Client deposits
    prisma.transaction.create({
      data: {
        userId: clients[0].id,
        amount: 2300,
        type: "ESCROW_DEPOSIT",
        description: "إيداع ضمان من العميل #1",
      }
    }),
    prisma.transaction.create({
      data: {
        userId: clients[1].id,
        amount: 600,
        type: "ESCROW_DEPOSIT",
        description: "إيداع ضمان من العميل #2",
      }
    }),
    // Wallet topups
    prisma.transaction.create({
      data: {
        userId: clients[0].id,
        amount: 5000,
        type: "WALLET_TOPUP",
        description: "شحن محفظة",
      }
    }),
    prisma.transaction.create({
      data: {
        userId: vendors[0].id,
        amount: 10000,
        type: "WALLET_TOPUP",
        description: "شحن محفظة",
      }
    }),
  ]);

  // 12. Create Withdrawal Requests
  console.log("💸 Creating Withdrawal Requests...");
  await Promise.all([
    // Pending withdrawals
    prisma.withdrawalRequest.create({
      data: {
        vendorId: vendors[0].id,
        amount: 5000,
        status: "PENDING",
      }
    }),
    prisma.withdrawalRequest.create({
      data: {
        vendorId: vendors[1].id,
        amount: 3000,
        status: "PENDING",
      }
    }),
    // Approved withdrawals
    prisma.withdrawalRequest.create({
      data: {
        vendorId: vendors[2].id,
        amount: 2000,
        status: "APPROVED",
        reviewedById: admin.id,
        reviewedAt: new Date(),
      }
    }),
    prisma.withdrawalRequest.create({
      data: {
        vendorId: vendors[3].id,
        amount: 4000,
        status: "APPROVED",
        reviewedById: admin.id,
        reviewedAt: new Date(),
      }
    }),
    // Rejected withdrawal
    prisma.withdrawalRequest.create({
      data: {
        vendorId: vendors[4].id,
        amount: 1500,
        status: "REJECTED",
        reviewNote: "رصيد غير كافٍ",
        reviewedById: admin.id,
        reviewedAt: new Date(),
      }
    }),
  ]);

  // 13. Create Delivery Tracking for some requests
  console.log("📍 Creating Delivery Tracking...");
  
  // Create a request with delivery assigned
  const deliveryRequest = await prisma.request.create({
    data: {
      clientId: clients[0].id,
      title: "توصيل طلب صيانة #101",
      description: "توصيل الجهاز للعميل بعد الصيانة.",
      categoryId: techCategory.subcategories[0].id,
      address: "مدينة نصر، شارع مصطفى النحاس",
      status: "ORDER_PAID_PENDING_DELIVERY",
      deliveryPhone: clients[0].phone || "+201012345678",
      assignedDeliveryAgentId: riders[0].id,
      latitude: 30.0561,
      longitude: 31.3304,
    }
  });

  await Promise.all([
    prisma.deliveryTracking.create({
      data: {
        requestId: deliveryRequest.id,
        status: "OUT_FOR_DELIVERY",
        locationText: "القاهرة، مدينة نصر",
        note: "المندوب في الطريق",
      }
    }),
    prisma.deliveryTracking.create({
      data: {
        requestId: deliveryRequest.id,
        status: "IN_TRANSIT",
        locationText: "شارع مصطفى النحاس",
        note: "اقترب من الموقع",
      }
    }),
  ]);

  // Another delivery request
  const deliveryRequest2 = await prisma.request.create({
    data: {
      clientId: clients[1].id,
      title: "توصيل طلب صيانة #102",
      description: "توصيل الجهاز للعميل.",
      categoryId: homeCategory.subcategories[0].id,
      address: "المهندسين، شارع جامعة الدول",
      status: "ORDER_PAID_PENDING_DELIVERY",
      deliveryPhone: clients[1].phone || "+201023456789",
      assignedDeliveryAgentId: riders[1].id,
      latitude: 30.0628,
      longitude: 31.2056,
    }
  });

  await prisma.deliveryTracking.create({
    data: {
      requestId: deliveryRequest2.id,
      status: "VENDOR_PREPARING",
      locationText: "المهندسين",
      note: "جاري تحضير الطلب",
    }
  });

  // 14. Create Notifications
  console.log("🔔 Creating Notifications...");
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: "NEW_REQUEST",
        title: "طلب جديد",
        message: "تم استلام طلب صيانة جديد.",
        isRead: false,
      }
    }),
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: "WITHDRAWAL_REQUESTED",
        title: "طلب سحب جديد",
        message: "قام أحد الموردين بطلب سحب.",
        isRead: false,
      }
    }),
    prisma.notification.create({
      data: {
        userId: clients[0].id,
        type: "OFFER_RECEIVED",
        title: "عرض جديد",
        message: "لديك عرض جديد على طلبك.",
        isRead: true,
      }
    }),
    prisma.notification.create({
      data: {
        userId: vendors[0].id,
        type: "BID_ACCEPTED",
        title: "تم قبول عرضك",
        message: "تم قبول عرضك من قبل العميل.",
        isRead: false,
      }
    }),
  ]);

  console.log("\n✅ Seed Completed Successfully!");
  console.log("\n📊 Summary:");
  console.log(`   • Users: ${1 + clients.length + vendors.length + riders.length} (1 Admin, ${clients.length} Clients, ${vendors.length} Vendors, ${riders.length} Riders)`);
  console.log(`   • Categories: 15 main categories with 100+ subcategories covering all Egyptian services & products`);
  console.log(`   • Requests: Pending, Open, Closed, Rejected`);
  console.log(`   • Bids: Multiple bids on open requests`);
  console.log(`   • Transactions: 10+ financial transactions`);
  console.log(`   • Withdrawals: Pending, Approved, Rejected`);
  console.log(`   • Delivery: Active tracking data`);
  console.log("\n🔐 LOGIN CREDENTIALS:");
  console.log("-----------------------------------------");
  console.log("ADMIN:    admin@shoofly.com      | password123");
  console.log("CLIENT:   client1@shoofly.com    | password123");
  console.log("VENDOR:   vendor1@shoofly.com    | password123");
  console.log("RIDER:    rider1@shoofly.com     | password123");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
