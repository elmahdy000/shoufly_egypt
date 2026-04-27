import { prisma } from '@/lib/prisma';

export async function listVendorOpenRequests(vendorId: number, filters: { governorateId?: number, cityId?: number } = {}, limit = 20, offset = 0) {
  // Filter by vendor's categories
  const vendorData = await prisma.user.findUnique({
    where: { id: vendorId },
    include: { vendorCategories: true },
  });

  const categoryIds = vendorData?.vendorCategories.map((vc: { categoryId: number }) => vc.categoryId) || [];

  if (categoryIds.length === 0) return [];

  const requests = await prisma.request.findMany({
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
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      latitude: true,
      longitude: true,
      address: true,
      images: { select: { filePath: true }, take: 1 },
      category: true,
      governorate: true,
      city: true,
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

  // Anonymize client names
  return requests.map(req => ({
    ...req,
    client: {
      ...req.client,
      fullName: `عميل #${req.client.id}`
    }
  }));
}
