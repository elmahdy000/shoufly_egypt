import { prisma } from '../lib/prisma';

async function seedEgyptBrideHomeUniverse() {
  console.log('👰 Bride & Home Expansion: Adding Cookware, Linens, and Home Equipment...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null, type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'PRODUCT') {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType, type },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // 1. BRIDE & HOME WORLD (تجهيز العرايس ومحل المنزل)
  const homeStore = await getOrCreateCat('تجهيز العرايس ومستلزمات المنزل', 'bride-home-store', null, null, 'PRODUCT');
  
  // Products
  await getOrCreateCat('أطقم حلل وأدوات طبخ', 'cookware-sets', homeStore.id, 'HOME_BRANDS', 'PRODUCT');
  await getOrCreateCat('أطقم عشاء وتقديم (النيش)', 'dinner-sets', homeStore.id, null, 'PRODUCT');
  await getOrCreateCat('المفروشات والمنسوجات (فوط/ملايات)', 'linens-bedding', homeStore.id, null, 'PRODUCT');
  await getOrCreateCat('أجهزة مطبخ كهربائية', 'kitchen-appliances-small', homeStore.id, 'APPLIANCES', 'PRODUCT');
  await getOrCreateCat('ديكور ورفايع المنزل', 'home-decor-tools', homeStore.id, null, 'PRODUCT');
  
  // Services (Interior planning for brides)
  await getOrCreateCat('فرش وتنسيق شقق العرايس', 'bride-home-styling', homeStore.id, null, 'SERVICE');

  // BRANDS FOR HOME
  const homeBrands = ['Nouval', 'Tefal', 'True', 'El-Zeny', 'Moulinex', 'Black & Decker', 'Kenwood', 'Tornado'];
  for (const bName of homeBrands) {
    const bSlug = `home-${bName.toLowerCase().replace(/\s+/g, '-')}`;
    await prisma.brand.upsert({
      where: { slug: bSlug },
      update: { name: bName, type: 'HOME_BRANDS' },
      create: { name: bName, slug: bSlug, type: 'HOME_BRANDS' }
    });
  }

  console.log('✅ Bride & Home Equipment Universe Successfully Integrated!');
}

seedEgyptBrideHomeUniverse()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
