import { prisma } from '../lib/prisma';

async function seedEgyptFemaleServices() {
  console.log('🌸 Female Services Expansion: Adding specialized categories for women...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null, type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'SERVICE') {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType, type },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // 1. BEAUTY & SPA AT HOME (جمال وعناية بالمنزل)
  const beautyHome = await getOrCreateCat('صالون تجميل منزلي', 'beauty-at-home', null, null, 'SERVICE');
  await getOrCreateCat('ميكب آرتيست (مناسبات)', 'makeup-artist-home', beautyHome.id, null, 'SERVICE');
  await getOrCreateCat('كوافير وتصفيف شعر', 'hair-dresser-home', beautyHome.id, null, 'SERVICE');
  await getOrCreateCat('رسم حنة وتاتو', 'henna-artist', beautyHome.id, null, 'SERVICE');
  await getOrCreateCat('باديكير ومانيكير (Nails)', 'nail-care-home', beautyHome.id, null, 'SERVICE');
  await getOrCreateCat('حمام مغربي وتنظيف بشرة', 'skincare-spa-home', beautyHome.id, null, 'SERVICE');
  await getOrCreateCat('إزالة شعر (سويت/ليزر)', 'hair-removal-home', beautyHome.id, null, 'SERVICE');

  // 2. FASHION & TAILORING (خياطة وتفصيل)
  const fashion = await getOrCreateCat('أتيليه وخياطة', 'fashion-tailoring', null, null, 'SERVICE');
  await getOrCreateCat('تفصيل فساتين وسواريه', 'dress-making', fashion.id, null, 'SERVICE');
  await getOrCreateCat('تعديلات ملابس (رفا وتضويق)', 'clothing-alterations', fashion.id, null, 'SERVICE');
  await getOrCreateCat('تطريز هاند ميد وشغل خرز', 'hand-embroidery', fashion.id, null, 'SERVICE');

  // 3. HOME FOOD & SWEETS (أكل بيتي وحلويات)
  const homeFood = await getOrCreateCat('مطبخ البيت "شغل بيتي"', 'home-kitchen', null, null, 'PRODUCT');
  await getOrCreateCat('وجبات وعزومات منزلية', 'home-cooked-meals', homeFood.id, null, 'PRODUCT');
  await getOrCreateCat('تورت وحلويات للمناسبات', 'pastry-sweets', homeFood.id, null, 'PRODUCT');
  await getOrCreateCat('تجهيز خضروات (أكل متفرز)', 'frozen-food-prep', homeFood.id, null, 'PRODUCT');

  // 4. FITNESS & WELLNESS (رشاقة وصحة)
  const wellness = await getOrCreateCat('رشاقة وصحة للسيدات', 'female-wellness');
  await getOrCreateCat('مدربة فتنس / يوجا (للسيدات)', 'female-trainer', wellness.id);
  await getOrCreateCat('مساج استرخائي (للسيدات)', 'female-massage', wellness.id);
  await getOrCreateCat('استشارات تغذية ودايت', 'nutritionist', wellness.id);

  // 5. TRAINING & SKILLS (تعليم ومهارات)
  const skills = await getOrCreateCat('تعليم وهوايات للبنات', 'female-skills');
  await getOrCreateCat('تعليم كروشيه وتريكو', 'crochet-knitting', skills.id);
  await getOrCreateCat('تعليم رسم وفنون تشكيلية', 'art-lessons', skills.id);
  await getOrCreateCat('تعليم قيادة سيارات (سيدات فقط)', 'female-driving-instructor', skills.id);

  // 6. EVENT PLANNING (تنظيم حفلات خاصة)
  const specialEvents = await getOrCreateCat('حفلات ومناسبات خاصة', 'female-events');
  await getOrCreateCat('تنظيم ليلة الحنة', 'henna-party-planner', specialEvents.id);
  await getOrCreateCat('تنظيم بيبي شاور ومواليد', 'baby-shower-planner', specialEvents.id);
  await getOrCreateCat('تنسيق هدايا وورد', 'gifts-flowers', specialEvents.id);

  console.log('✅ Female Services Concept Seeded Successfully!');
}

seedEgyptFemaleServices()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
