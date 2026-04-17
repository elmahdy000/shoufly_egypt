import { prisma } from '../lib/prisma';

async function expandCarParts() {
  console.log('🚗 Expanding Car Parts & Accessories specialized categories...');

  // Find the parent 'cars' category
  const cars = await prisma.category.findUnique({ where: { slug: 'cars' } });
  if (!cars) {
    console.error('Core "cars" category not found. Please run the full reset seed first.');
    return;
  }

  // Helper
  async function addSub(name: string, slug: string, bType: string | null = 'CARS', type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'PRODUCT') {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId: cars.id, requiresBrand: !!bType, brandType: bType, type },
       create: { name, slug, parentId: cars.id, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // Specialized Parts
  await addSub('قطع غيار سيارات (جديد)', 'car-parts-new', 'CARS', 'PRODUCT');
  await addSub('قطع غيار سيارات (استيراد)', 'car-parts-used', 'CARS', 'PRODUCT');
  await addSub('كماليات وأكسسوارات سيارات', 'car-accessories', 'CARS', 'PRODUCT');
  await addSub('كاوتش وجنوط وبطاريات', 'tires-rims-batteries', 'CARS', 'PRODUCT');
  await addSub('زيوت وشحوم وفلاتر', 'car-oils-filters', 'CARS', 'PRODUCT');
  await addSub('كاسيت وأنظمة صوت', 'car-audio-systems', 'CARS', 'PRODUCT');
  await addSub('تجهيزات سيارات (تعديل)', 'car-tuning-mods', 'CARS', 'SERVICE');

  console.log('✅ Car Parts Universe Expanded Successfully!');
}

expandCarParts()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
