import { prisma } from '../lib/prisma';

async function seedCategoriesAndBrands() {
  console.log('🚀 Seeding Grand Categories and Brands...');

  // 1. CARS SECTION
  const carsParent = await prisma.category.upsert({
    where: { slug: 'cars' },
    update: {},
    create: { name: 'السيارات', slug: 'cars' }
  });

  const carSubCategories = [
    { name: 'قطع غيار السيارات', slug: 'car-parts', brandType: 'CARS' },
    { name: 'صيانة وميكانيكا', slug: 'car-repair', brandType: 'CARS' },
    { name: 'إطارات وبطاريات', slug: 'tires-batteries', brandType: 'CARS' }
  ];

  for (const sub of carSubCategories) {
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { parentId: carsParent.id, requiresBrand: true, brandType: sub.brandType },
      create: { name: sub.name, slug: sub.slug, parentId: carsParent.id, requiresBrand: true, brandType: sub.brandType }
    });
  }

  const carBrands = ['تويوتا', 'ميتسوبيشي (لانسر)', 'هيونداي', 'كيا', 'مرسيدس', 'بي إم دبليو', 'نيسان', 'رينو', 'فيات', 'شيري'];
  for (const bName of carBrands) {
    await prisma.brand.upsert({
      where: { slug: bName.toLowerCase().replace(/ /g, '-') },
      update: { type: 'CARS' },
      create: { name: bName, slug: bName.toLowerCase().replace(/ /g, '-'), type: 'CARS' }
    });
  }

  // 2. ELECTRONICS SECTION (Mobiles/Laptops)
  const electronicsParent = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { name: 'الإلكترونيات', slug: 'electronics' }
  });

  const elecSubCategories = [
    { name: 'صيانة موبايلات', slug: 'mobile-repair', brandType: 'MOBILES' },
    { name: 'صيانة لابتوب', slug: 'laptop-repair', brandType: 'LAPTOPS' }
  ];

  for (const sub of elecSubCategories) {
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { parentId: electronicsParent.id, requiresBrand: true, brandType: sub.brandType },
      create: { name: sub.name, slug: sub.slug, parentId: electronicsParent.id, requiresBrand: true, brandType: sub.brandType }
    });
  }

  const mobileBrands = ['آيفون', 'سامسونج', 'شاومي', 'أوبو', 'ريلمي', 'هواوي'];
  for (const bName of mobileBrands) {
    await prisma.brand.upsert({
      where: { slug: `mob-${bName}` },
      update: { type: 'MOBILES' },
      create: { name: bName, slug: `mob-${bName}`, type: 'MOBILES' }
    });
  }

  // 3. HOME APPLIANCES SECTION
  const homeParent = await prisma.category.upsert({
    where: { slug: 'home-appliances' },
    update: {},
    create: { name: 'الأجهزة المنزلية', slug: 'home-appliances' }
  });

  const homeSubCategories = [
    { name: 'صيانة تكييفات', slug: 'ac-repair', brandType: 'APPLIANCES' },
    { name: 'توصيل غاز وسباكة', slug: 'plumbing', brandType: 'NONE' }
  ];

  for (const sub of homeSubCategories) {
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { parentId: homeParent.id, requiresBrand: sub.brandType !== 'NONE', brandType: sub.brandType },
      create: { name: sub.name, slug: sub.slug, parentId: homeParent.id, requiresBrand: sub.brandType !== 'NONE', brandType: sub.brandType }
    });
  }

  const applianceBrands = ['توشيبا', 'شارب', 'فريش', 'إل جي', 'سامسونج (أجهزة)', 'زانوسي', 'يونيون إير'];
  for (const bName of applianceBrands) {
    await prisma.brand.upsert({
      where: { slug: `app-${bName}` },
      update: { type: 'APPLIANCES' },
      create: { name: bName, slug: `app-${bName}`, type: 'APPLIANCES' }
    });
  }

  console.log('✅ Grand Seed completed successfully!');
}

seedCategoriesAndBrands()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
