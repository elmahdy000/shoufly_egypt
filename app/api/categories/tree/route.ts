import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAPCache } from '@/lib/api-optimizations';

export const GET = withAPCache(async (req: NextRequest) => {
  try {
    // Get all categories with their subcategories
    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // Only root categories
      },
      include: {
        subcategories: {
          select: { id: true, name: true, slug: true, parentId: true, requiresBrand: true, brandType: true },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { subcategories: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}, { ttl: 3600 });
