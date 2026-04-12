import { prisma } from '@/lib/prisma';

export async function getPlatformSettings() {
  let settings = await prisma.platformSetting.findFirst();

  if (!settings) {
    // Initialize defaults if missing
    settings = await prisma.platformSetting.create({
      data: {
        commissionPercent: 15,
        minVendorMatchCount: 3,
        initialRadiusKm: 5,
        maxRadiusKm: 50,
        radiusExpansionStepKm: 5,
      },
    });
  }

  return settings;
}

export async function updatePlatformSettings(data: {
  commissionPercent?: number;
  minVendorMatchCount?: number;
  initialRadiusKm?: number;
  maxRadiusKm?: number;
  radiusExpansionStepKm?: number;
}) {
  const settings = await getPlatformSettings();

  return prisma.platformSetting.update({
    where: { id: settings.id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}
