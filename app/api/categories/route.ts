import { NextRequest, NextResponse } from 'next/server';
import { getCategories } from '@/lib/services/categories/get-categories';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentIdParam = searchParams.get('parentId');
    const parentIdParsed = parentIdParam ? parseInt(parentIdParam, 10) : NaN;
    const parentId = !isNaN(parentIdParsed) ? parentIdParsed : null;

    const categories = await getCategories({ parentId });

    return NextResponse.json(categories);
  } catch (error: unknown) {
    logError('CATEGORIES_GET', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}
