import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function verifyUser(userId: number, isVerified: boolean) {
  logger.info('admin.moderation.verify', { userId, isVerified });
  
  // 🛡️ Check if user exists first
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, isVerified: true }
  });
  
  if (!existingUser) {
    throw new Error(`المستخدم رقم ${userId} غير موجود.`);
  }
  
  // Idempotency: don't update if already in desired state
  if (existingUser.isVerified === isVerified) {
    return existingUser;
  }
  
  return prisma.user.update({
    where: { id: userId },
    data: { isVerified },
    select: { id: true, fullName: true, isVerified: true }
  });
}

export async function blockUser(userId: number, isBlocked: boolean) {
  logger.info('admin.moderation.block', { userId, isBlocked });
  
  // 🛡️ Check if user exists first
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, isBlocked: true, role: true }
  });
  
  if (!existingUser) {
    throw new Error(`المستخدم رقم ${userId} غير موجود.`);
  }
  
  // 🛡️ Prevent blocking admin accounts (safety measure)
  if (existingUser.role === 'ADMIN' && isBlocked) {
    throw new Error('لا يمكن حظر حسابات الإدارة. يرجى استخدام صلاحيات السوبر أدمن.');
  }
  
  // Idempotency: don't update if already in desired state
  if (existingUser.isBlocked === isBlocked) {
    return existingUser;
  }
  
  return prisma.user.update({
    where: { id: userId },
    data: { isBlocked },
    select: { id: true, fullName: true, isBlocked: true }
  });
}
