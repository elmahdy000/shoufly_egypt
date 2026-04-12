import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');

    const categories = await prisma.category.findMany({
      where: {
        parentId: parentId ? parseInt(parentId) : null,
      },
      include: {
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
}
