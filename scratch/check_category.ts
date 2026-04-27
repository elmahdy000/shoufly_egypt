
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findUnique({
    where: { id: 437 },
    include: {
      parent: true,
      children: true,
    }
  });

  console.log('Category 437:', JSON.stringify(category, null, 2));

  const allCategories = await prisma.category.findMany({
    select: { id: true, name: true, nameAr: true }
  });
  console.log('Total categories in DB:', allCategories.length);
  
  // Find a category with name similar to what the user might be choosing
  const similar = allCategories.filter(c => c.id > 400);
  console.log('Categories around 400:', similar);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
