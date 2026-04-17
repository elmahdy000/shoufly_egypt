import { prisma } from '../lib/prisma';

async function seedEgyptUltra() {
  console.log('🇪🇬 Ultra Expansion: Adding detailed micro-services for the Egyptian client...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null, type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'SERVICE') {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType, type },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // 1. DAILY LIFE SUPPORT (أساسيات الحياة اليومية)
  const lifeSupport = await getOrCreateCat('احتياجات يومية', 'daily-needs', null, null, 'SERVICE');
  await getOrCreateCat('صيانة وتركيب فلاتر مياه', 'water-filters', lifeSupport.id, 'FILTERS', 'SERVICE');
  await getOrCreateCat('تعبئة وصيانة أسطوانات غاز', 'gas-bottles', lifeSupport.id, null, 'SERVICE');
  await getOrCreateCat('صيانة إنتركام وكوالين شفرة', 'intercom-locks', lifeSupport.id, null, 'SERVICE');
  await getOrCreateCat('صيانة مصاعد وأساسنير', 'elevator-maintenance', lifeSupport.id, null, 'SERVICE');

  // 2. EDUCATION & TUTORING (التعليم والدروس)
  const education = await getOrCreateCat('التعليم والمهارات', 'education', null, null, 'DIGITAL');
  await getOrCreateCat('دروس خصوصية (مناهج)', 'tutors-school', education.id, null, 'SERVICE');
  await getOrCreateCat('تعليم لغات (English/German)', 'languages-tutor', education.id, null, 'DIGITAL');
  await getOrCreateCat('تحفيظ قرآن وتعاليم دينية', 'quran-teaching', education.id, null, 'DIGITAL');
  await getOrCreateCat('برمجة وجرافيك للأطفال', 'kids-coding', education.id, null, 'DIGITAL');

  // 3. SPECIALIZED CAR SERVICES (خدمات سيارات تخصصية)
  const carExtra = await getOrCreateCat('كماليات وتكنولوجيا السيارات', 'car-extras');
  await getOrCreateCat('برمجة مفاتيح وشفرات سيارات', 'car-key-programming', carExtra.id, 'CARS');
  await getOrCreateCat('فرش وتنجيد كراسي سيارات', 'car-upholstery', carExtra.id);
  await getOrCreateCat('عزل وحماية وتفييم (Fame)', 'car-tinting-ppf', carExtra.id);

  // 4. FAMILY & PET CARE (الأسرة والحيوانات)
  const care = await getOrCreateCat('الرعاية والأسرة', 'family-care');
  await getOrCreateCat('جليسة أطفال (بيبي سيتر)', 'babysitter', care.id);
  await getOrCreateCat('جليس / مرافق كبار سن', 'elderly-companion', care.id);
  await getOrCreateCat('تدريب ورعاية حيوانات أليفة', 'pet-care-training', care.id);

  // 5. SMALL KITCHEN APPLIANCES (أجهزة المطبخ الصغيرة)
  const smallKitchen = await getOrCreateCat('أجهزة مطبخ صغيرة', 'small-kitchen');
  await getOrCreateCat('صيانة ميكروويف وقلاية هوائية', 'microwave-airfryer', smallKitchen.id, 'APPLIANCES');
  await createCatExtra('صيانة خلاطات ومحضرات طعام', 'blender-repair', smallKitchen.id, 'APPLIANCES');
  await createCatExtra('صيانة غلايات وماكينات قهوة', 'coffee-maker-repair', smallKitchen.id, 'APPLIANCES');

  // BRANDS FOR FILTERS
  const filterBrands = { type: 'FILTERS', names: ['Tank', 'Panasonic', 'Aqua-TreX', 'Pure', 'Kent'] };
  for (const bName of filterBrands.names) {
    const bSlug = `filter-${bName.toLowerCase()}`;
    await prisma.brand.upsert({
      where: { slug: bSlug },
      update: { name: bName, type: 'FILTERS' },
      create: { name: bName, slug: bSlug, type: 'FILTERS' }
    });
  }

  // Mini helper because createCat was used above
  async function createCatExtra(name: string, slug: string, parentId: number, bType: string | null = null) {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType }
     });
  }

  console.log('✅ Ultra Egyptian Client Needs Seed Completed!');
}

seedEgyptUltra()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
