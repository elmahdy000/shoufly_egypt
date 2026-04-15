import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { verifyUser, blockUser } from '@/lib/services/admin/moderation';
import { z } from 'zod';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

const ModerationSchema = z.object({
  action: z.enum(['VERIFY', 'UNVERIFY', 'BLOCK', 'UNBLOCK']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getCurrentUser(req.headers);
    requireUser(admin);
    requireRole(admin, 'ADMIN');

    const { userId } = await params;
    const uid = parseInt(userId);
    if (isNaN(uid)) throw new Error('Invalid userId');

    const body = await req.json();
    const { action } = ModerationSchema.parse(body);

    let result;
    switch (action) {
      case 'VERIFY': result = await verifyUser(uid, true); break;
      case 'UNVERIFY': result = await verifyUser(uid, false); break;
      case 'BLOCK': result = await blockUser(uid, true); break;
      case 'UNBLOCK': result = await blockUser(uid, false); break;
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    logError('USER_MODERATION', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}
