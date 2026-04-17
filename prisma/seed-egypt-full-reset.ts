import { prisma } from '../lib/prisma';

async function resetAndSeedEgypt() {
  console.log('🧹 Clearing old transaction data (Requests, Bids, etc.)...');
  
  // Clean up order of relations to avoid FK errors
  await prisma.review.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.deliveryTracking.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.bidImage.deleteMany({});
  await prisma.requestImage.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.request.deleteMany({});
  await prisma.vendorBrand.deleteMany({});
  await prisma.vendorCategory.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('🏗️ Building Professional Egyptian Market Taxonomy...');

  // Helper
  async function createCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null, type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'SERVICE') {
     return prisma.category.create({
       data: { name, slug, parentId, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // 1. AUTOMOTIVE (السيارات)
  const cars = await createCat('السيارات والمحركات', 'cars', null, null, 'SERVICE');
  await createCat('قطع غيار سيارات', 'car-parts', cars.id, 'CARS', 'PRODUCT');
  await createCat('ميكانيكا وعمرة صيانة', 'car-repair', cars.id, 'CARS', 'SERVICE');
  await createCat('كهرباء وتكييف سيارات', 'car-electric', cars.id, 'CARS', 'SERVICE');
  await createCat('عفشة ورادياتير', 'car-suspension', cars.id, 'CARS', 'SERVICE');
  await createCat('كاوتش وبطاريات', 'tires-batteries', cars.id, 'CARS', 'PRODUCT');
  await createCat('ونش إنقاذ سريع', 'towing-truck', cars.id, null, 'SERVICE');

  // 2. ELECTRONICS (الإلكترونيات)
  const elec = await createCat('الإلكترونيات والموبايل', 'electronics', null, null, 'SERVICE');
  await createCat('صيانة موبايل وآيباد', 'mobile-repair', elec.id, 'MOBILES', 'SERVICE');
  await createCat('صيانة لابتوب وكمبيوتر', 'laptop-repair', elec.id, 'LAPTOPS', 'SERVICE');
  await createCat('ألعاب وبلاي ستيشن', 'gaming-repair', elec.id, 'GAMING', 'SERVICE');
  await createCat('صيانة شاشات وتلفزيون', 'tv-screens', elec.id, 'APPLIANCES', 'SERVICE');

  // 3. HOME APPLIANCES (الأجهزة المنزلية)
  const appliances = await createCat('الأجهزة المنزلية', 'home-appliances', null, null, 'SERVICE');
  await createCat('ثلاجات وفريزر', 'fridge-maintenance', appliances.id, 'APPLIANCES', 'SERVICE');
  await createCat('غسالات ملابس وأطباق', 'washer-maintenance', appliances.id, 'APPLIANCES', 'SERVICE');
  await createCat('صيانة تكييفات', 'ac-maintenance', appliances.id, 'APPLIANCES', 'SERVICE');
  await createCat('بوتاجازات وأفران', 'stove-maintenance', appliances.id, 'APPLIANCES', 'SERVICE');
  await createCat('سخانات (غاز وكهرباء)', 'heater-maintenance', appliances.id, 'APPLIANCES', 'SERVICE');

  // 4. HOME SERVICES (المنزل والتشطيبات)
  const home = await createCat('المنزل والتشطيبات', 'home-services', null, null, 'SERVICE');
  await createCat('سباكة وأعمال صحية', 'plumbing-works', home.id, null, 'SERVICE');
  await createCat('كهرباء وتأسيس', 'home-electricity', home.id, null, 'SERVICE');
  await createCat('نجارة باب وشباك', 'home-carpentry', home.id, null, 'SERVICE');
  await createCat('ألوميتال وزجاج', 'home-alumital', home.id, null, 'SERVICE');
  await createCat('نقاشة ودهانات', 'home-painting', home.id, null, 'SERVICE');

  // BRANDS
  const brands = [
    { type: 'CARS', names: ['تويوتا', 'هيونداي', 'كيا', 'فيات', 'مرسيدس', 'بي إم دبليو', 'شيري', 'MG', 'رينو', 'نيسان'] },
    { type: 'MOBILES', names: ['آيفون', 'سامسونج', 'شاومي', 'أوبو', 'ريلمي', 'هواوي'] },
    { type: 'APPLIANCES', names: ['توشيبا', 'شارب', 'زانوسي', 'فريش', 'إل جي', 'كريازي', 'تورنيدو'] },
    { type: 'LAPTOPS', names: ['ديل', 'اتش بي', 'لينوفو', 'أبل ماك', 'أسوس'] }
  ];

  for (const group of brands) {
    for (const bName of group.names) {
      const bSlug = `${group.type.toLowerCase()}-${bName.replace(/\s+/g, '-').toLowerCase()}`;
      await prisma.brand.create({
        data: { name: bName, slug: bSlug, type: group.type }
      });
    }
  }

  console.log('🚀 Egypt Professional Market Reset & Seed Success!');
}

resetAndSeedEgypt()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
