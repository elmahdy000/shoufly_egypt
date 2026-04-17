import { prisma } from '../lib/prisma';

async function listCurrentCats() {
  const cats = await prisma.category.findMany();
  console.log(JSON.stringify(cats, null, 2));
}

listCurrentCats().finally(() => prisma.$disconnect());
