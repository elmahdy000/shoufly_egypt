import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fail, ok } from '@/lib/utils/http-response';

// GET - Fetch current settings
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'ADMIN');

    // Get settings from database or return defaults
    const settings = await prisma.platformSetting.findFirst();

    return ok({
      commission: settings ? Number(settings.commissionPercent) : 15,
      vat: 14, // Default VAT
      radius: settings?.maxRadiusKm || 50,
      minOrder: 100, // Default min order
      minVendorMatch: settings?.minVendorMatchCount || 3,
      initialRadius: settings?.initialRadiusKm || 5,
      radiusStep: settings?.radiusExpansionStepKm || 5
    });

  } catch (error) {
    console.error('Settings GET API error:', error);
    return fail(error);
  }
}

// POST - Update settings
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'ADMIN');

    const body = await req.json();
    const { commission, vat, radius, minOrder, minVendorMatch, initialRadius, radiusStep } = body;

    // Upsert settings
    const settings = await prisma.platformSetting.upsert({
      where: { id: 1 },
      update: {
        commissionPercent: commission,
        maxRadiusKm: radius,
        minVendorMatchCount: minVendorMatch,
        initialRadiusKm: initialRadius,
        radiusExpansionStepKm: radiusStep
      },
      create: {
        commissionPercent: commission || 15,
        maxRadiusKm: radius || 50,
        minVendorMatchCount: minVendorMatch || 3,
        initialRadiusKm: initialRadius || 5,
        radiusExpansionStepKm: radiusStep || 5
      }
    });

    return ok({
      success: true,
      settings: {
        commission: Number(settings.commissionPercent),
        radius: settings.maxRadiusKm,
        minVendorMatch: settings.minVendorMatchCount,
        initialRadius: settings.initialRadiusKm,
        radiusStep: settings.radiusExpansionStepKm
      }
    });

  } catch (error) {
    console.error('Settings POST API error:', error);
    return fail(error);
  }
}
