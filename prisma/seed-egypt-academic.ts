import { prisma } from '../lib/prisma';

async function seedEgyptAcademicUniverse() {
  console.log('🎓 Academic Expansion: Adding Scientific Research, Higher Education, and Specialized Tutoring...');

  // Helper
  async function getOrCreateCat(name: string, slug: string, parentId: number | null = null, bType: string | null = null, type: 'SERVICE' | 'PRODUCT' | 'DIGITAL' = 'DIGITAL') {
     return prisma.category.upsert({
       where: { slug },
       update: { name, parentId, requiresBrand: !!bType, brandType: bType, type },
       create: { name, slug, parentId, requiresBrand: !!bType, brandType: bType, type }
     });
  }

  // 1. ACADEMIC & RESEARCH (البحث العلمي والتعليم العالي)
  const academicWorld = await getOrCreateCat('الأبحاث العلمية والتعليم العالي', 'academic-research-world', null, null, 'DIGITAL');
  
  // Digital Services
  await getOrCreateCat('تنسيق ومراجعة رسائل علمية', 'thesis-formatting-editing', academicWorld.id, null, 'DIGITAL');
  await getOrCreateCat('التحليل الإحصائي والبيانات (SPSS)', 'statistical-analysis', academicWorld.id, null, 'DIGITAL');
  await getOrCreateCat('الترجمة الأكاديمية المتخصصة', 'academic-translation', academicWorld.id, null, 'DIGITAL');
  await getOrCreateCat('شرح مواد جامعية تخصصية', 'specialized-university-tutoring', academicWorld.id, null, 'DIGITAL');
  await getOrCreateCat('مساعدة في جمع المصادر والمراجع', 'research-sourcing', academicWorld.id, null, 'DIGITAL');
  await getOrCreateCat('كتابة مشاريع تخرج وأبحاث', 'graduation-projects-help', academicWorld.id, null, 'DIGITAL');
  await getOrCreateCat('كورسات وبرامج تخصصية', 'specialized-courses', academicWorld.id, null, 'DIGITAL');

  console.log('✅ Academic & Research Universe Successfully Integrated!');
}

seedEgyptAcademicUniverse()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
