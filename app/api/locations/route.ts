import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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
}
