import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function verifyUser(userId: number, isVerified: boolean) {
  logger.info('admin.moderation.verify', { userId, isVerified });
  
  return prisma.user.update({
    where: { id: userId },
    data: { isVerified },
    select: { id: true, fullName: true, isVerified: true }
  });
}

export async function blockUser(userId: number, isBlocked: boolean) {
  logger.info('admin.moderation.block', { userId, isBlocked });
  
  return prisma.user.update({
    where: { id: userId },
    data: { isBlocked },
    select: { id: true, fullName: true, isBlocked: true }
  });
}
