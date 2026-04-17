import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const brands = await prisma.brand.findMany({
    where: type ? { type } : {},
    orderBy: { name: "asc" },
  });
  
  return NextResponse.json(brands);
}
