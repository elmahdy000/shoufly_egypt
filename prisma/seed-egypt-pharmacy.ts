import { prisma } from '../lib/prisma';

async function seedEgyptPharmacy() {
  console.log('💊 Pharmacy Expansion: Integrating Pharmacies and Medicine Sourcing...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null, type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'PRODUCT') {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType, type },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // 1. PHARMACY CORE (الصيدليات والأدوية)
  const pharmacy = await getOrCreateCat('الصيدليات والأدوية', 'pharmacy-world', null, null, 'PRODUCT');
  await getOrCreateCat('البحث عن دواء معين (نواقص)', 'find-medicine', pharmacy.id, null, 'PRODUCT');
  await getOrCreateCat('منتجات صيدلية (عامة)', 'general-pharmacy', pharmacy.id, null, 'PRODUCT');
  await getOrCreateCat('مستلزمات وألبان أطفال', 'baby-pharmacy-needs', pharmacy.id, null, 'PRODUCT');
  await getOrCreateCat('أجهزة طبية (ضغط/سكر/ترمومتر)', 'home-medical-devices', pharmacy.id, null, 'PRODUCT');
  await getOrCreateCat('فيتامينات ومكملات غذائية', 'vitamins-supplements', pharmacy.id, null, 'PRODUCT');
  await getOrCreateCat('مستحضرات تجميل طبية', 'medical-cosmetics', pharmacy.id, null, 'PRODUCT');

  console.log('✅ Pharmacy & Medicine Sourcing Integratred Successfully!');
}

seedEgyptPharmacy()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
