import { prisma } from '../lib/prisma';

async function seedEgyptPetLivestockUniverse() {
  console.log('🐾 Pet & Livestock Expansion: Adding Pet care, Veterinary, and Feed/Fodder categories...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null, type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'PRODUCT') {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType, type },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // 1. PETS & ANIMALS WORLD (عالم الحيوانات والطيور)
  const petWorld = await getOrCreateCat('عالم الحيوانات والماشية', 'pet-livestock-world', null, null, 'PRODUCT');
  
  // Products
  await getOrCreateCat('أكل ومستلزمات حيوانات أليفة', 'pet-food-supplies', petWorld.id, null, 'PRODUCT');
  await getOrCreateCat('الأعلاف ونغذية الماشية والطيور', 'livestock-poultry-feed', petWorld.id, null, 'PRODUCT');
  await getOrCreateCat('أحواض سمك ومستلزمات زينة', 'aquarium-supplies', petWorld.id, null, 'PRODUCT');
  
  // Services
  await getOrCreateCat('الرعاية البيطرية (كشف منزلي)', 'mobile-veterinary', petWorld.id, null, 'SERVICE');
  await getOrCreateCat('تدريب وتعديل سلوك كلاب', 'dog-training', petWorld.id, null, 'SERVICE');
  await getOrCreateCat('حلاقة ونظافة (Grooming)', 'pet-grooming', petWorld.id, null, 'SERVICE');
  await getOrCreateCat('رعاية سمك الزينة (صيانة أحواض)', 'aquarium-maintenance', petWorld.id, null, 'SERVICE');

  console.log('✅ Pet & Livestock Universe Successfully Integrated!');
}

seedEgyptPetLivestockUniverse()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
