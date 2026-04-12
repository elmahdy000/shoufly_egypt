import { prisma } from '@/lib/prisma';

export async function listVendorBids(vendorId: number) {
  const bids = await prisma.bid.findMany({
    where: { vendorId },
    include: {
      request: {
        select: {
          id: true,
          title: true,
          categoryId: true,
          status: true,
        },
      },
      vendor: { select: { id: true, fullName: true } },
      images: {
        select: {
          id: true,
          filePath: true,
          fileName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return bids;
}
