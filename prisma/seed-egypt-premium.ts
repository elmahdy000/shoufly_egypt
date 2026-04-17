import { prisma } from '../lib/prisma';

async function seedEgyptPremiumIndustries() {
  console.log('🏗️ Premium Expansion: Integrating Industrial, Infrastructure, and Professional Services...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null) {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType }
     });
  }

  // 1. CONSTRUCTION & MATERIALS (المواد والإنشاءات)
  const construct = await getOrCreateCat('المقاولات ومواد البناء', 'construction');
  await getOrCreateCat('توريد مواد بناء (رمل/أسمنت/طوب)', 'construction-materials', construct.id);
  await getOrCreateCat('مقاولات هدم وبناء وخرسانة', 'construction-contractor', construct.id);
  await getOrCreateCat('تقطيع وتركيب رخام وجرانيت', 'marble-granite', construct.id);
  await getOrCreateCat('عزل أسطح ضد الرطوبة والمطر', 'roof-insulation', construct.id);

  // 2. ENERGY & SMART SYSTEMS (الطاقة والأنظمة)
  const energy = await getOrCreateCat('الطاقة والأنظمة الذكية', 'energy-smart');
  await getOrCreateCat('تركيب وصيانة طاقة شمسية', 'solar-energy', energy.id, 'SOLAR');
  await getOrCreateCat('صيانة مولدات كهرباء', 'generators-repair', energy.id, 'GENERATORS');
  await getOrCreateCat('أنظمة المنازل الذكية (Smart Home)', 'smart-home-systems', energy.id);

  // 3. INFRASTRUCTURE & TANKS (البنية التحتية والخزانات)
  const infra = await getOrCreateCat('خدمات البنية التحتية', 'infrastructure');
  await getOrCreateCat('تنظيف وتعقيم خزانات مياه', 'water-tank-cleaning', infra.id);
  await getOrCreateCat('شفط وتسليك بلاعات وصرف', 'sewage-suction', infra.id);
  await getOrCreateCat('حراسة وتأمين عقارات', 'property-security', infra.id);

  // 4. PROFESSIONAL EQUIPMENT (معدات مهنية)
  const profEquip = await getOrCreateCat('صيانة معدات مهنية', 'professional-equipment');
  await getOrCreateCat('صيانة معدات عيادات وأسنان', 'medical-equipment-repair', profEquip.id, 'MEDICAL_DEVICES');
  await getOrCreateCat('صيانة معدات مطاعم وكافيهات', 'restaurant-equipment', profEquip.id, 'CATERING_EQUIP');
  await getOrCreateCat('صيانة أجهزة جيم (Fitness)', 'gym-equipment-repair', profEquip.id, 'GYM_BRANDS');

  // 5. HOBBIES & SPECIALIZED (الهوايات والتخصصات)
  const hobbies = await getOrCreateCat('هوايات وتخصصات', 'hobbies-specialized');
  await getOrCreateCat('صيانة عجلات (Bicycles)', 'bicycle-repair', hobbies.id, 'BIKE_BRANDS');
  await getOrCreateCat('تصليح ودوزنة آلات موسيقية', 'musical-instrument-repair', hobbies.id);
  await getOrCreateCat('ورش زجاج ومرايا', 'glass-mirrors-workshop', hobbies.id);

  // BRANDS FOR SOLAR & GYM
  const extraBrands = [
    { type: 'SOLAR', names: ['Jinko', 'Canadian Solar', 'Trina', 'Huawei Solar', 'SMA'] },
    { type: 'GYM_BRANDS', names: ['Life Fitness', 'Technogym', 'Matrix', 'Precor', 'Star Trac'] },
    { type: 'BIKE_BRANDS', names: ['Trinx', 'Giant', 'Trek', 'Orbea', 'Phoenix'] }
  ];

  for (const group of extraBrands) {
    for (const bName of group.names) {
      const bSlug = `${group.type.toLowerCase()}-${bName.replace(/\s+/g, '-').toLowerCase()}`;
      await prisma.brand.upsert({
        where: { slug: bSlug },
        update: { name: bName, type: group.type },
        create: { name: bName, slug: bSlug, type: group.type }
      });
    }
  }

  console.log('✅ Premium Egypt Market Infrastructure Expansion Success!');
}

seedEgyptPremiumIndustries()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
