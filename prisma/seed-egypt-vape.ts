import { prisma } from '../lib/prisma';

async function seedEgyptVapeYouthUniverse() {
  console.log('💨 Vape & Youth Expansion: Adding Specialized Vaping, Smoking, and Youth Gadget categories...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null, type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'PRODUCT') {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType, type },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // 1. VAPE & SMOKING WORLD (عالم التدخين والـ Vape)
  const smokeWorld = await getOrCreateCat('عالم التبغ والـ Vape', 'smoke-vape-world', null, null, 'PRODUCT');
  
  // Products
  await getOrCreateCat('أجهزة Vape و Pod Systems', 'vape-devices', smokeWorld.id, 'VAPE_BRANDS', 'PRODUCT');
  await getOrCreateCat('زيوت ليكويد (E-Juice)', 'vape-liquids', smokeWorld.id, null, 'PRODUCT');
  await getOrCreateCat('قطع غيار (كويلات/قطن/تانك)', 'vape-parts', smokeWorld.id, 'VAPE_BRANDS', 'PRODUCT');
  await getOrCreateCat('تبغ وسيجار ولاعات ماركات', 'tobacco-cigars', smokeWorld.id, null, 'PRODUCT');
  await getOrCreateCat('مستلزمات شيشة وفحم', 'shisha-supplies', smokeWorld.id, null, 'PRODUCT');
  
  // 2. YOUTH GADGETS & DIGITAL (عالم الشباب والترفيه)
  const youthWorld = await getOrCreateCat('عالم الشباب والترفيه', 'youth-entertainment', null, null, 'PRODUCT');
  await getOrCreateCat('بطاقات شحن وألعاب (Gaming)', 'gaming-cards', youthWorld.id, null, 'DIGITAL');
  await getOrCreateCat('إكسسوارات وتكنولوجيا شبابية', 'youth-gadgets', youthWorld.id, null, 'PRODUCT');
  await getOrCreateCat('هدايا وأطقم تدخين فخمة', 'smokers-gifts', youthWorld.id, null, 'PRODUCT');

  // BRANDS FOR VAPE
  const vapeBrands = ['SMOK', 'Vaporesso', 'Voopoo', 'GeekVape', 'Uwell', 'Lost Vape', 'Suorin'];
  for (const bName of vapeBrands) {
    const bSlug = `vape-${bName.toLowerCase().replace(/\s+/g, '-')}`;
    await prisma.brand.upsert({
      where: { slug: bSlug },
      update: { name: bName, type: 'VAPE_BRANDS' },
      create: { name: bName, slug: bSlug, type: 'VAPE_BRANDS' }
    });
  }

  console.log('✅ Vape & Youth Universe Successfully Integrated!');
}

seedEgyptVapeYouthUniverse()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
