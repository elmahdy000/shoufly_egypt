import { prisma } from "@/lib/prisma";

export async function listAdminRequests(limit = 200, offset = 0, status?: string) {
  const where = status ? { status: status as any } : {};
  return prisma.request.findMany({
    where,
    include: {
      category: true,
      client: { select: { id: true, fullName: true, email: true } },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}
