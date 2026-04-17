import { prisma } from '../lib/prisma';

async function seedEgyptGrandFinale() {
  console.log('🏛️ Grand Finale Expansion: Covering the Last Mile of the Egyptian Market...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null, type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'SERVICE') {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType, type },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // 1. INDUSTRIAL WORKSHOPS (الورش والصناعة)
  const industrial = await getOrCreateCat('الورش والصناعات الصغيرة', 'industrial-workshops', null, null, 'SERVICE');
  await getOrCreateCat('خراتة ولحام (أرجون/كهرباء)', 'lathe-welding', industrial.id, null, 'SERVICE');
  await getOrCreateCat('تصنيع تروس وقطع غيار تخصصية', 'parts-manufacturing', industrial.id, null, 'SERVICE');
  await getOrCreateCat('سباكة معادن وصب', 'metal-casting', industrial.id, null, 'SERVICE');

  // 2. FIRE SAFETY & PROTECTION (الأمان والحماية)
  const safety = await getOrCreateCat('الأمان والحماية المدنية', 'fire-safety', null, null, 'SERVICE');
  await getOrCreateCat('صيانة وتعبئة طفايات حريق', 'fire-extinguisher', safety.id, null, 'SERVICE');
  await getOrCreateCat('تركيب أنظمة إنذار حريق', 'fire-alarm-systems', safety.id, null, 'SERVICE');

  // 3. MODERN FINISHING (تشطيبات حديثة)
  const finishing = await getOrCreateCat('تشطيبات وديكور حديث', 'modern-finishing', null, null, 'SERVICE');
  await getOrCreateCat('جبسوم بورد وأسقف معلقة', 'gypsum-board', finishing.id, null, 'SERVICE');
  await getOrCreateCat('أرضيات باركيه ورق حائط', 'parquet-wallpaper', finishing.id, null, 'SERVICE');

  // 4. WATER SOLUTIONS (حلول المياه الكبرى)
  const waterPro = await getOrCreateCat('حلول وآبار المياه', 'water-solutions-pro');
  await getOrCreateCat('دق آبار وجسات تربة', 'well-drilling', waterPro.id, null, 'SERVICE');
  await getOrCreateCat('تركيب محطات تحلية مياه', 'water-desalination', waterPro.id, null, 'SERVICE');
  await getOrCreateCat('توصيل جالونات مياه شرب', 'water-gallons-delivery', waterPro.id, null, 'PRODUCT');

  // 5. CORPORATE & EVENTS (خدمات الشركات والمعارض)
  const corporate = await getOrCreateCat('خدمات الشركات والمعارض', 'corporate-events', null, null, 'SERVICE');
  await getOrCreateCat('تخطيط مؤتمرات ومعارض', 'conference-planning', corporate.id, null, 'SERVICE');
  await getOrCreateCat('ترجمة فورية ومعدات صوت', 'simultaneous-translation', corporate.id, null, 'SERVICE');

  // 6. GIFTS & SOCIAL (هدايا وعلاقات اجتماعية)
  const gifts = await getOrCreateCat('هدايا وزهور ومناسبات', 'gifts-flowers-world', null, null, 'PRODUCT');
  await getOrCreateCat('تنسيق زهور وهدايا خاصة', 'floral-gift-design', gifts.id, null, 'PRODUCT');
  await getOrCreateCat('تخطيط عشاء وحفلات خاصة', 'private-event-planning', gifts.id, null, 'SERVICE');

  // 7. SEASONAL & RELIGIOUS (خدمات موسمية ودينية)
  const seasonal = await getOrCreateCat('خدمات موسمية ودينية', 'seasonal-religious', null, null, 'SERVICE');
  await getOrCreateCat('حجز وتوزيع أضاحي العيد', 'qurban-services', seasonal.id, null, 'PRODUCT');
  await getOrCreateCat('تجهيز كراتين رمضان وصدقات', 'ramadan-boxes', seasonal.id, null, 'PRODUCT');
  await getOrCreateCat('تنظيف وتعقيم دور العبادة', 'mosque-church-cleaning', seasonal.id, null, 'SERVICE');

  // 8. WASTE & RECYCLING (إدارة النفايات والخردة)
  const recycling = await getOrCreateCat('إدارة الخردة والنفايات', 'waste-recycling', null, null, 'SERVICE');
  await getOrCreateCat('شراء حديد وخردة وأجهزة قديمة', 'scrap-buying', recycling.id, null, 'SERVICE');
  await getOrCreateCat('تجميع زيوت الطعام المستعملة', 'used-oil-collection', recycling.id, null, 'SERVICE');

  console.log('✅ The Grand Finale of Egypt Market Taxonomy Successfully Integrated!');
}

seedEgyptGrandFinale()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
