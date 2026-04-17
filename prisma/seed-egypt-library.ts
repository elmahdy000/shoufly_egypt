import { prisma } from '../lib/prisma';

async function seedEgyptLibraryUniverse() {
  console.log('📚 Library Expansion: Adding Stationery, Books, and School Supplies for the Egyptian family...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null, type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'PRODUCT') {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType, type },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // 1. LIBRARY & EDUCATION (المكتبات والتعليم)
  const libraryWorld = await getOrCreateCat('المكتبات ومستلزمات الدراسة', 'library-school-world', null, null, 'PRODUCT');
  
  // Products
  await getOrCreateCat('الكتب الخارجية والمناهج', 'external-books', libraryWorld.id, null, 'PRODUCT');
  await getOrCreateCat('قصص وروايات أطفال', 'children-stories', libraryWorld.id, null, 'PRODUCT');
  await getOrCreateCat('أدوات مكتبية (سبلايز)', 'stationery-supplies', libraryWorld.id, null, 'PRODUCT');
  await getOrCreateCat('أدوات رسم وفنون وكرافت', 'art-craft-supplies', libraryWorld.id, null, 'PRODUCT');
  await getOrCreateCat('ألعاب تعليمية وتنمية مهارات', 'educational-toys', libraryWorld.id, null, 'PRODUCT');
  
  // Services
  await getOrCreateCat('خدمات الطباعة وتجليد الكتب', 'printing-binding', libraryWorld.id, null, 'SERVICE');
  await getOrCreateCat('تجهيز لوحات ووسائل تعليمية', 'school-projects-help', libraryWorld.id, null, 'SERVICE');

  console.log('✅ Library & Education Supplies Successfully Integrated!');
}

seedEgyptLibraryUniverse()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
