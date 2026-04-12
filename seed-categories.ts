import { prisma } from './lib/prisma';
import 'dotenv/config';

async function seedSubcategories() {
  console.log('🌱 Seeding Subcategories...');

  const mainCategory = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { name: 'Electronics', slug: 'electronics' }
  });

  const subcategories = [
    { name: 'Mobile Phones', slug: 'mobile-phones' },
    { name: 'Laptops', slug: 'laptops' },
    { name: 'Accessories', slug: 'accessories' }
  ];

  for (const sub of subcategories) {
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { parentId: mainCategory.id },
      create: { 
        name: sub.name, 
        slug: sub.slug, 
        parentId: mainCategory.id 
      }
    });
  }

  console.log('✅ Subcategories seeded successfully.');
}

seedSubcategories();
