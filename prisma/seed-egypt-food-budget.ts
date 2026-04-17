import { prisma } from '../lib/prisma';

async function seedFoodBudget() {
  console.log('🍽️ Seeding "Food & Budget" Ecosystem...');

  const parent = await prisma.category.upsert({
    where: { slug: 'food-services' },
    update: { type: 'PRODUCT' },
    create: {
      name: 'خدمات الطعام والوجبات',
      slug: 'food-services',
      type: 'PRODUCT'
    }
  });

  const subCategories = [
    { name: 'وجبات عائلية (بميزانية محددة)', slug: 'family-meals-budget' },
    { name: 'وجبات أفراد (سريعة)', slug: 'single-meals-budget' },
    { name: 'تجهيز عزومات وحفلات', slug: 'party-catering-budget' },
    { name: 'وجبات عمل وشركات', slug: 'corporate-meals' },
    { name: 'أكل بيتي وصحي (اشتراكات)', slug: 'home-food-subscriptions' }
  ];

  for (const sub of subCategories) {
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { parentId: parent.id, type: 'PRODUCT' },
      create: {
        name: sub.name,
        slug: sub.slug,
        parentId: parent.id,
        type: 'PRODUCT'
      }
    });
  }

  console.log('✅ Food & Budget categories finalized.');
}

seedFoodBudget()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
