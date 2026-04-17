import { prisma } from '../lib/prisma';

async function seedEgyptHyperNiche() {
  console.log('💎 Hyper-Niche Expansion: Adding the "Rarest" and most essential detailed services...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null) {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType }
     });
  }

  // 1. WATER MOTORS & URGENT (مواتير المياه والطوارئ)
  const urgent = await getOrCreateCat('خدمات الطوارئ والمياه', 'urgent-water');
  await getOrCreateCat('صيانة ولف مواتير مياه', 'water-motor-repair', urgent.id);
  await getOrCreateCat('تركيب أوتوماتيك وبالونة موتور', 'water-motor-parts', urgent.id);
  await getOrCreateCat('صيانة طلمبات غاطسة', 'submersible-pumps', urgent.id);

  // 2. SHUTTERS & GATES (الشيش والبوابات)
  const gates = await getOrCreateCat('البوابات والحماية', 'gates-shutters');
  await getOrCreateCat('صيانة شيش حصيرة (Shutters)', 'window-shutters', gates.id);
  await getOrCreateCat('حدادة كريتال وبوابات ليزر', 'iron-gates-fences', gates.id);
  await getOrCreateCat('تركيب سلك شبابيك ومنخل', 'window-mesh', gates.id);

  // 3. RARE SKILLS & ANTIQUES (مهارات نادرة وأنتيكات)
  const rare = await getOrCreateCat('مهارات نادرة وأنتيكات', 'rare-skills');
  await getOrCreateCat('صيانة ساعات (ساعاتي)', 'watch-repair', rare.id);
  await getOrCreateCat('تجديد وتلميع نحاس وأنتيك', 'antique-restoration', rare.id);
  await getOrCreateCat('تدهيب صالونات وأثاث مذهب', 'gold-leaf-furniture', rare.id);

  // 4. FLOORING SPECIALISTS (فنيين الأرضيات)
  const floors = await getOrCreateCat('أرضيات وتكسيات', 'flooring-expert');
  await getOrCreateCat('قشط ودهان باركيه', 'parquet-sanding', floors.id);
  await getOrCreateCat('جلي وتلميع رخام وسيراميك', 'floor-polishing', floors.id);
  await getOrCreateCat('تركيب نجيل صناعي ولاندسكيب', 'artificial-grass', floors.id);

  // 5. LUXURY CAR CARE (العناية الفائقة بالسيارات)
  const luxCar = await getOrCreateCat('عناية فاخرة بالسيارات', 'luxury-car-care');
  await getOrCreateCat('شفط صدمات بدون دهان (PDR)', 'pdr-fix', luxCar.id);
  await getOrCreateCat('نانو سيراميك وحماية (Detailing)', 'car-detailing', luxCar.id);
  await getOrCreateCat('صيانة فتحة سقف وكراسي كهرباء', 'sunroof-seats-repair', luxCar.id);

  // 6. SWIMMING POOLS (حمامات السباحة)
  const pools = await getOrCreateCat('حمامات السباحة', 'swimming-pools');
  await getOrCreateCat('صيانة فلاتر وطلمبات مسابح', 'pool-maintenance', pools.id);
  await getOrCreateCat('عزل وكشف تسريب مسابح', 'pool-insulation', pools.id);

  // 7. WALL ART (فن الجدران)
  const wallArt = await getOrCreateCat('ديكور وجدران', 'wall-decor');
  await getOrCreateCat('فني براويز وبرايز لوحات', 'framing-service', wallArt.id);
  await getOrCreateCat('تركيب ورق حائط وبانوهات', 'wallpaper-install', wallArt.id);

  console.log('✅ Hyper-Niche Egypt Expansion Success! The system is now unmatched.');
}

seedEgyptHyperNiche()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
