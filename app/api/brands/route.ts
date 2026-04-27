import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createErrorResponse, logError } from "@/lib/utils/error-handler";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const subcategoryId = searchParams.get("subcategoryId");

    let brandType = type;

    // لو جاء subcategoryId، نجيب brandType من الـ category نفسها
    if (subcategoryId && !brandType) {
      const categoryId = parseInt(subcategoryId);
      if (!isNaN(categoryId)) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
          select: { brandType: true },
        });
        brandType = category?.brandType ?? null;
      }
    }

    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
        ...(brandType ? { type: brandType } : {}),
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(brands);
  } catch (error: unknown) {
    logError('BRANDS_GET', error);
    const { response, status } = createErrorResponse(error, 500);
    return NextResponse.json(response, { status });
  }
}
