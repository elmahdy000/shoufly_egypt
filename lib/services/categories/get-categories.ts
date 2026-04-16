import { prisma } from '@/lib/prisma';

export async function getCategories(params?: { parentId?: number | null }) {
  const { parentId = null } = params || {};

  return prisma.category.findMany({
    where: {
      parentId: parentId,
    },
    include: {
      subcategories: true,
      _count: {
        select: { subcategories: true }
      }
    },
    orderBy: { name: 'asc' },
  });
}
