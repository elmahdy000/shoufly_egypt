import { prisma } from '@/lib/prisma';

export async function listVendorOpenRequests(vendorId: number, filters: { governorateId?: number, cityId?: number } = {}, limit = 20, offset = 0) {
  // Filter by vendor's categories
  const vendorData = await prisma.user.findUnique({
    where: { id: vendorId },
    include: { vendorCategories: true },
  });

  const categoryIds = vendorData?.vendorCategories.map((vc: { categoryId: number }) => vc.categoryId) || [];

  if (categoryIds.length === 0) return [];

  return prisma.request.findMany({
    where: {
      status: {
        in: ['OPEN_FOR_BIDDING', 'BIDS_RECEIVED'],
      },
      categoryId: {
        in: categoryIds,
      },
      ...(filters.governorateId ? { governorateId: filters.governorateId } : {}),
      ...(filters.cityId ? { cityId: filters.cityId } : {}),
    },
    include: {
      category: true,
      client: { 
        select: { id: true, fullName: true } 
      },
      _count: { 
        select: { bids: true } 
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}
