import { prisma } from '@/lib/prisma';

export async function listCategories(includeSubcategories = true) {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null, // Get top-level categories
    },
    include: {
      subcategories: includeSubcategories,
      _count: {
        select: { requests: true }
      }
    },
    orderBy: { name: 'asc' },
  });

  return categories;
}

export async function getSubcategories(parentId: number) {
  return prisma.category.findMany({
    where: { parentId },
    include: {
      _count: {
        select: { requests: true }
      }
    },
    orderBy: { name: 'asc' },
  });
}
