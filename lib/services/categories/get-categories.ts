import { prisma } from '../../prisma';
import { Cache } from '../../cache';

export async function getCategories(params?: { parentId?: number | null }) {
  const { parentId = null } = params || {};
  const cacheKey = `categories_tree:${parentId ?? 'root'}`;

  // ⚡ RAM-FIRST Retrieval (Redis)
  return Cache.getOrSet(cacheKey, async () => {
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
  }, 86400); // Cache for 24 hours (Categories change rarely)
}
