import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { updateVendorProfile } from '@/lib/services/vendors/update-profile';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  fullName: z.string().min(3).optional(),
  phone: z.string().min(10).optional(),
  categoryIds: z.array(z.number()).optional(),
});

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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: message.includes('Unauthorized') ? 401 : 400 }
    );
  }
}
