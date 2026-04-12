import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export interface UpdateVendorProfilePayload {
  fullName?: string;
  phone?: string;
  categoryIds?: number[];
}

export async function updateVendorProfile(vendorId: number, payload: UpdateVendorProfilePayload) {
  logger.info('vendor.profile.update.started', { vendorId, ...payload });

  const { fullName, phone, categoryIds } = payload;

  return prisma.$transaction(async (tx) => {
    // 1. Update basic user info
    const updatedUser = await tx.user.update({
      where: { id: vendorId },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        vendorCategories: {
          select: { categoryId: true }
        }
      }
    });

    // 2. Update Categories if provided
    if (categoryIds !== undefined) {
      logger.info('vendor.profile.categories.sync', { vendorId, categoryIds });
      
      // Delete old relations
      await tx.vendorCategory.deleteMany({
        where: { vendorId }
      });

      // Create new relations
      if (categoryIds.length > 0) {
        await tx.vendorCategory.createMany({
          data: categoryIds.map(id => ({
            vendorId,
            categoryId: id
          }))
        });
      }
    }

    logger.info('vendor.profile.update.success', { vendorId });
    return updatedUser;
  });
}
