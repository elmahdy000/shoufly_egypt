import { prisma } from '../lib/prisma';

async function seedEgyptComputerUniverse() {
  console.log('💻 Computer Universe Expansion: Building the ultimate IT & PC marketplace for Egypt...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null, type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'PRODUCT') {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType, type },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // 1. COMPUTER DISCOVERY (عالم الكمبيوتر واللابتوب)
  const pcWorld = await getOrCreateCat('عالم الكمبيوتر واللابتوب', 'pc-laptop-world', null, null, 'PRODUCT');
  
  // Products
  await getOrCreateCat('لابتوب وأجهزة (جديد)', 'laptops-new', pcWorld.id, 'LAPTOPS', 'PRODUCT');
  await getOrCreateCat('لابتوب وأجهزة (استيراد الخارج)', 'laptops-used', pcWorld.id, 'LAPTOPS', 'PRODUCT');
  await getOrCreateCat('قطع غيار (رام/هارد/شاشات)', 'pc-parts', pcWorld.id, 'LAPTOPS', 'PRODUCT');
  await getOrCreateCat('أكسسوارات (ماوس/كيبورد/شواحن)', 'pc-accessories', pcWorld.id, null, 'PRODUCT');
  
  // Services
  await getOrCreateCat('تجميع أجهزة (Gaming/Workstation)', 'pc-building', pcWorld.id, null, 'SERVICE');
  await getOrCreateCat('صيانة هاردوير (ماذربورد/بايوس)', 'pc-hardware-repair', pcWorld.id, 'LAPTOPS', 'SERVICE');
  await getOrCreateCat('سوفت وير ويندوز وتعريفات', 'pc-software-install', pcWorld.id, null, 'SERVICE');
  await getOrCreateCat('تركيب شبكات ومنظومات واي فاي', 'networking-wifi', pcWorld.id, null, 'SERVICE');

  // BRANDS FOR LAPTOPS
  const pcBrands = ['Dell', 'HP', 'Lenovo', 'Apple (MacBook)', 'Asus', 'Acer', 'MSI', 'Gigabyte'];
  for (const bName of pcBrands) {
    const bSlug = `pc-${bName.toLowerCase().replace(/\s+/g, '-')}`;
    await prisma.brand.upsert({
      where: { slug: bSlug },
      update: { name: bName, type: 'LAPTOPS' },
      create: { name: bName, slug: bSlug, type: 'LAPTOPS' }
    });
  }

  console.log('✅ Computer & IT Universe Successfully Integrated!');
}

seedEgyptComputerUniverse()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
