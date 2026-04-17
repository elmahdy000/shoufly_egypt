import { prisma } from '../lib/prisma';

async function seedEgyptUniversalConcierge() {
  console.log('🚀 Universal Concierge Expansion: Making the app a Personal Assistant for ANYTHING...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null, type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'SERVICE') {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType, type },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // 1. SHOPPING & SOURCING (شراء وتوفير منتجات)
  const sourcing = await getOrCreateCat('شوفلي وادفعلي (شراء وتوفير)', 'shopping-sourcing', null, null, 'PRODUCT');
  await getOrCreateCat('ابحث لي عن منتج نادر (برفانات/ماركات)', 'find-rare-product', sourcing.id, null, 'PRODUCT');
  await getOrCreateCat('شراء وتوصيل طلبات خاصة', 'personal-shopper', sourcing.id, null, 'PRODUCT');
  await getOrCreateCat('توفير مواد خام وأقمشة تخصصية', 'raw-materials-source', sourcing.id, null, 'PRODUCT');

  // 2. ON-DEMAND LEARNING (شرح ومذاكرة)
  const learning = await getOrCreateCat('شرح دروس ومذاكرة أونلاين', 'on-demand-learning', null, null, 'DIGITAL');
  await getOrCreateCat('شرح درس معين (فيديو/أونلاين)', 'explain-lesson', learning.id, null, 'DIGITAL');
  await getOrCreateCat('حل مسائل ومساعدة في أبحاث', 'homework-help', learning.id, null, 'DIGITAL');
  await getOrCreateCat('تلخيص كتب وملازم', 'summarization-service', learning.id, null, 'DIGITAL');

  // 3. DIGITAL ASSISTANCE (خدمات رقمية ومساعد شخصي)
  const digital = await getOrCreateCat('المساعد الرقمي والشخصي', 'digital-assistant', null, null, 'DIGITAL');
  await getOrCreateCat('كتابة CV وترجمة ملفات', 'writing-translation', digital.id, null, 'DIGITAL');
  await getOrCreateCat('تنسيق ملفات وتعديل صور', 'editing-formatting', digital.id, null, 'DIGITAL');
  await getOrCreateCat('حجز مواعيد واستفسارات', 'booking-concierge', digital.id, null, 'DIGITAL');

  // 4. ERRANDS & SPECIAL TASKS (مشاوير ومهام خاصة)
  const errands = await getOrCreateCat('مشاوير وطلبات خاصة', 'errands-tasks');
  await getOrCreateCat('دفع فواتير وتخليص معاملات', 'bill-payment-errands', errands.id);
  await getOrCreateCat('توصيل واستلام أمانات', 'secure-delivery', errands.id);
  await getOrCreateCat('توفير أدوية نادرة واستشارات', 'rare-medicine-finder', errands.id);

  // 5. ASK AN EXPERT (اسأل خبير)
  const expert = await getOrCreateCat('استشارات سريعة (سؤال وجواب)', 'ask-expert');
  await getOrCreateCat('نصيحة تقنية أو هندسية سريعة', 'quick-tech-consult', expert.id);
  await getOrCreateCat('استفسار قانوني أو شرعي', 'legal-religious-qa', expert.id);

  console.log('✅ Universal Concierge Expansion Success! The platform can now handle ANY request.');
}

seedEgyptUniversalConcierge()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
