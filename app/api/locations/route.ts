import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createErrorResponse, logError } from "@/lib/utils/error-handler";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'governorates' or 'cities'
    const governorateId = searchParams.get("governorateId");

    if (type === "cities" && governorateId) {
      const cities = await prisma.city.findMany({
        where: { governorateId: Number(governorateId) },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(cities);
    }

    const governorates = await prisma.governorate.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(governorates);
  } catch (error: unknown) {
    logError('LOCATIONS_GET', error);
    const { response, status } = createErrorResponse(error, 500);
    return NextResponse.json(response, { status });
  }
}
