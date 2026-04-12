/**
 * Database Access Layer Foundation
 * Contains helper functions for common database operations
 * This file will be expanded as the application grows
 */

import { prisma } from "./prisma";

export async function getUserById(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getCategoryById(categoryId: number) {
  return prisma.category.findUnique({
    where: { id: categoryId },
  });
}

export async function getRequestById(requestId: number) {
  return prisma.request.findUnique({
    where: { id: requestId },
    include: {
      client: true,
      category: true,
      images: true,
      bids: true,
      deliveryTracking: true,
    },
  });
}

export async function getPlatformSettings() {
  return prisma.platformSetting.findFirst();
}

const dbHelpers = {
  getUserById,
  getUserByEmail,
  getCategoryById,
  getRequestById,
  getPlatformSettings,
};

export default dbHelpers;
