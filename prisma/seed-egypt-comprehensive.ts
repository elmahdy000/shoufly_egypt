import { prisma } from '../lib/prisma';

async function seedComprehensiveEgypt() {
  console.log('🇪🇬 Starting Comprehensive Egypt Market Seeding...');

  // Helper to ensure category exists and is correct
  async function syncCategory(name: string, slug: string, parentId: number | null = null, bType: string = 'NONE') {
    return prisma.category.upsert({
      where: { slug },
      update: { 
        name, 
        parentId, 
        requiresBrand: bType !== 'NONE', 
        brandType: bType === 'NONE' ? null : bType 
      },
      create: { 
        name, 
        slug, 
        parentId, 
        requiresBrand: bType !== 'NONE', 
        brandType: bType === 'NONE' ? null : bType 
      }
    });
  }

  // 1. CARS
  const cars = await syncCategory('السيارات والمحركات', 'cars');
  await syncCategory('قطع غيار سيارات', 'car-parts', cars.id, 'CARS');
  await syncCategory('صيانة ميكانيكا وعمرة', 'car-repair', cars.id, 'CARS');
  await syncCategory('كهرباء وتكييف سيارات', 'car-electric', cars.id, 'CARS');
  await syncCategory('كاوتش وبطاريات', 'tires-batteries', cars.id, 'CARS');
  await syncCategory('سمكرة ودهان', 'car-body-painting', cars.id, 'CARS');
  await syncCategory('عفشة وهيدروليك', 'suspension-repair', cars.id, 'CARS');
  await syncCategory('ونش إنقاذ', 'car-towing', cars.id, 'NONE');

  // 2. ELECTRONICS
  const elec = await syncCategory('الإلكترونيات والموبايل', 'electronics');
  await syncCategory('صيانة موبايلات', 'mobile-repair', elec.id, 'MOBILES');
  await syncCategory('صيانة لابتوب وكمبيوتر', 'laptop-repair', elec.id, 'LAPTOPS');
  await syncCategory('بلاي ستيشن وألعاب', 'gaming-services', elec.id, 'GAMING');
  await syncCategory('صيانة شاشات', 'tv-screens-repair', elec.id, 'APPLIANCES');

  // 3. HOME APPLIANCES
  const homeApp = await syncCategory('الأجهزة المنزلية', 'home-appliances');
  await syncCategory('ثلاجات وفريزر', 'fridge-repair', homeApp.id, 'APPLIANCES');
  await syncCategory('غسالات ملابس', 'washer-repair', homeApp.id, 'APPLIANCES');
  await syncCategory('بوتاجازات وأفران', 'stove-repair', homeApp.id, 'APPLIANCES');
  await syncCategory('سخانات مياه', 'heater-repair', homeApp.id, 'APPLIANCES');
  await syncCategory('تكييف وتبريد', 'ac-repairing', homeApp.id, 'APPLIANCES');

  // 4. HOME SERVICES
  const homeServ = await syncCategory('المنزل والتشطيبات', 'home-maintenance');
  await syncCategory('سباكة وأعمال صحية', 'plumbing', homeServ.id, 'NONE');
  await syncCategory('كهرباء منازل', 'home-electricity', homeServ.id, 'NONE');
  await syncCategory('نجارة باب وشباك', 'carpentry', homeServ.id, 'NONE');
  await syncCategory('نقاشة ودهانات', 'painting', homeServ.id, 'NONE');
  await syncCategory('ألوميتال وزجاج', 'alumital', homeServ.id, 'NONE');

  // BRANDS SEEDING (Simplified slug approach)
  const brands = [
    { type: 'CARS', names: ['Toyota', 'Hyundai', 'Kia', 'Fiat', 'Nissan', 'Mercedes', 'BMW', 'Chery', 'MG', 'Renault', 'Mitsubishi', 'Skoda'] },
    { type: 'MOBILES', names: ['iPhone', 'Samsung', 'Xiaomi', 'Oppo', 'Realme', 'Huawei', 'Infinix'] },
    { type: 'APPLIANCES', names: ['Toshiba', 'Sharp', 'Fresh', 'Zanussi', 'LG', 'Kiriazi', 'Unionaire', 'Beko', 'Tornado'] },
    { type: 'LAPTOPS', names: ['Dell', 'HP', 'Lenovo', 'ASUS', 'Apple-Mac', 'Acer'] }
  ];

  for (const group of brands) {
    for (const bName of group.names) {
      const bSlug = `${group.type.toLowerCase()}-${bName.toLowerCase()}`;
      await prisma.brand.upsert({
        where: { slug: bSlug },
        update: { name: bName, type: group.type },
        create: { name: bName, slug: bSlug, type: group.type }
      });
    }
  }

  console.log('✅ Egypt Strategic Seed Success!');
}

seedComprehensiveEgypt()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
