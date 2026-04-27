import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export interface UpdateVendorProfilePayload {
  fullName?: string;
  phone?: string;
  categoryIds?: number[];
  brandIds?: number[];
  latitude?: number;
  longitude?: number;
  vendorAddress?: string;
}

export async function updateVendorProfile(vendorId: number, payload: UpdateVendorProfilePayload) {
  logger.info('vendor.profile.update.started', { vendorId, ...payload });

  const { fullName, phone, categoryIds, brandIds, latitude, longitude, vendorAddress } = payload;

  return prisma.$transaction(async (tx) => {
    // 1. Update basic user info
    const updatedUser = await tx.user.update({
      where: { id: vendorId },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(vendorAddress !== undefined && { vendorAddress }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        vendorCategories: {
          select: { categoryId: true }
        },
        vendorBrands: {
          select: { brandId: true }
        }
      }
    });

    // 2. Update Categories if provided
    if (categoryIds !== undefined) {
      logger.info('vendor.profile.categories.sync', { vendorId, categoryIds });
      await tx.vendorCategory.deleteMany({ where: { vendorId } });
      if (categoryIds.length > 0) {
        await tx.vendorCategory.createMany({
          data: categoryIds.map(id => ({ vendorId, categoryId: id }))
        });
      }
    }

    // 3. Update Brands if provided
    if (brandIds !== undefined) {
      logger.info('vendor.profile.brands.sync', { vendorId, brandIds });
      await tx.vendorBrand.deleteMany({ where: { vendorId } });
      if (brandIds.length > 0) {
        await tx.vendorBrand.createMany({
          data: brandIds.map(id => ({ vendorId, brandId: id }))
        });
      }
    }

    logger.info('vendor.profile.update.success', { vendorId });
    return updatedUser;
  });
}
