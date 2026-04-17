import { prisma } from '../lib/prisma';

async function seedEgyptMarketMega() {
  console.log('🇪🇬 Expansion: Adding Mega-Categories for the Egyptian Market...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null, type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'SERVICE') {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType, type },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // 1. EVENTS & PHOTOGRAPHY (المناسبات والتصوير)
  const events = await getOrCreateCat('المناسبات والحفلات', 'events', null, null, 'SERVICE');
  await getOrCreateCat('تصوير فوتوغرافي وفيديو', 'photography', events.id, null, 'SERVICE');
  await getOrCreateCat('دي جي وأنظمة صوت', 'dj-sound', events.id, null, 'SERVICE');
  await getOrCreateCat('تجهيز بوفيه وكايرتنج', 'catering', events.id, null, 'PRODUCT');
  await getOrCreateCat('تزيين قاعات وحفلات', 'party-decoration', events.id, null, 'SERVICE');

  // 2. LOGISTICS & MOVING (النقل والشحن)
  const logistics = await getOrCreateCat('النقل واللوجستيات', 'logistics', null, null, 'SERVICE');
  await getOrCreateCat('نقل عفش (فك وتركيب)', 'furniture-moving', logistics.id, null, 'SERVICE');
  await getOrCreateCat('ونش رفع أثاث', 'furniture-lift', logistics.id, null, 'SERVICE');
  await getOrCreateCat('توصيل طرود وطلبات', 'courier-service', logistics.id, null, 'SERVICE');
  await getOrCreateCat('نقل بضائع (نقل ثقيل)', 'trucking', logistics.id, null, 'SERVICE');

  // 3. MEDICAL SERVICES (الخدمات الطبية)
  const medical = await getOrCreateCat('الرعاية الطبية', 'medical', null, null, 'SERVICE');
  await getOrCreateCat('تمريض منزلي باليومية', 'home-nursing', medical.id, null, 'SERVICE');
  await getOrCreateCat('علاج طبيعي منزلي', 'physiotherapy-home', medical.id, null, 'SERVICE');
  await getOrCreateCat('تأجير وصيانة أجهزة طبية', 'medical-equipment', medical.id, null, 'SERVICE');

  // 4. CLEANING & PEST CONTROL (التنظيف والمكافحة)
  const cleaning = await getOrCreateCat('التنظيف والمكافحة', 'cleaning');
  await getOrCreateCat('تنظيف شقق وفلل', 'house-cleaning', cleaning.id);
  await getOrCreateCat('غسيل سجاد وستائر', 'carpet-wash', cleaning.id);
  await getOrCreateCat('مكافحة حشرات وقوارض', 'pest-control', cleaning.id);
  await getOrCreateCat('تنسيق حدائق ورش', 'gardening', cleaning.id);

  // 5. IT & COMPUTER (الكمبيوتر والشبكات)
  const it = await getOrCreateCat('الكمبيوتر والبرمجيات', 'it-services');
  await getOrCreateCat('تنزيل ويندوز وبرامج', 'os-install', it.id);
  await getOrCreateCat('تركيب شبكات وراوتر', 'networking', it.id, 'NETWORKING');
  await getOrCreateCat('صيانة طابعات وأحبار', 'printer-repair', it.id, 'PRINTERS');

  // 6. BEAUTY & SELF-CARE (الجمال والعناية الشخصية)
  const beauty = await getOrCreateCat('الجمال والعناية', 'beauty');
  await getOrCreateCat('حلاق رجالي (للمنزل)', 'barber-home', beauty.id);
  await getOrCreateCat('ميكب آرتيست وكوافير', 'makeup-artist', beauty.id);
  await getOrCreateCat('جلسات مساوج وسبا', 'massage-home', beauty.id);

  // 7. LEGAL & GOV (الخدمات القانونية والإدارية)
  const legal = await getOrCreateCat('الاستشارات والأوراق', 'legal-gov');
  await getOrCreateCat('ترجمة معتمدة', 'translation', legal.id);
  await getOrCreateCat('مساعدة في أوراق حكومية', 'gov-papers', legal.id);
  await getOrCreateCat('محامي واستشارات قانونية', 'legal-consult', legal.id);

  // 8. ADDITIONAL BRANDS
  const extraBrands = [
    { type: 'NETWORKING', names: ['TP-Link', 'D-Link', 'Huawei', 'Cisco', 'Tenda', 'Totolink'] },
    { type: 'PRINTERS', names: ['HP', 'Canon', 'Epson', 'Brother', 'Xerox', 'Samsung'] }
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

  console.log('✅ Mega Egypt Market Expansion Success!');
}

seedEgyptMarketMega()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
