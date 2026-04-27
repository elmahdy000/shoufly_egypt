import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getVendorStats } from '@/lib/services/vendors/get-vendor-stats';
import { updateVendorProfile } from '@/lib/services/vendors/update-profile';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  fullName: z.string().min(3).optional(),
  phone: z.string().min(10).optional(),
  categoryIds: z.array(z.number()).optional(),
  brandIds: z.array(z.number()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  vendorAddress: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const [profile, stats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          isVerified: true,
          verificationStatus: true,
          isBlocked: true,
          walletBalance: true,
          fcmToken: true,
          cityId: true,
          governorateId: true,
          nationalId: true,
          vehicleType: true,
          licensePlate: true,
          latitude: true,
          longitude: true,
          vendorAddress: true,
          idCardFrontUrl: true,
          idCardBackUrl: true,
          kycSubmissionDate: true,
          createdAt: true,
          updatedAt: true,
          vendorCategories: { include: { category: true } },
          vendorBrands: { include: { brand: true } },
        },
      }),
      getVendorStats(user.id),
    ]);

    if (!profile) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ profile, stats });
  } catch (error: unknown) {
    logError('VENDOR_PROFILE_GET', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const body = await req.json();
    const validated = UpdateProfileSchema.parse(body);

    const result = await updateVendorProfile(user.id, validated);
    return NextResponse.json(result);
  } catch (error: unknown) {
    logError('VENDOR_PROFILE_PATCH', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}
