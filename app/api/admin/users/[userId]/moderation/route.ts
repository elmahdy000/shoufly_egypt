import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { verifyUser, blockUser } from '@/lib/services/admin/moderation';
import { logAdminAction } from '@/lib/services/admin/audit-log';
import { z } from 'zod';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

const ModerationSchema = z.object({
  action: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(['VERIFY', 'UNVERIFY', 'BLOCK', 'UNBLOCK'])),
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
    let auditAction: 'USER_VERIFIED' | 'USER_UNVERIFIED' | 'USER_BLOCKED' | 'USER_UNBLOCKED';
    let oldValue: Record<string, unknown> = {};
    
    switch (action) {
      case 'VERIFY': 
        result = await verifyUser(uid, true); 
        auditAction = 'USER_VERIFIED';
        oldValue = { isVerified: false };
        break;
      case 'UNVERIFY': 
        result = await verifyUser(uid, false); 
        auditAction = 'USER_UNVERIFIED';
        oldValue = { isVerified: true };
        break;
      case 'BLOCK': 
        result = await blockUser(uid, true); 
        auditAction = 'USER_BLOCKED';
        oldValue = { isBlocked: false };
        break;
      case 'UNBLOCK': 
        result = await blockUser(uid, false); 
        auditAction = 'USER_UNBLOCKED';
        oldValue = { isBlocked: true };
        break;
    }
    
    // 📝 Log admin action to audit trail (non-blocking)
    logAdminAction({
      adminId: admin.id,
      action: auditAction,
      targetType: 'USER',
      targetId: uid,
      oldValue,
      newValue: result,
      metadata: { performedBy: admin.fullName || admin.email }
    }).catch(() => {
      // Audit logging failure should not break the main flow
    });

    // 🚀 Invalidate middleware Redis cache so block/unblock takes effect immediately
    if (action === 'BLOCK' || action === 'UNBLOCK') {
      try {
        const { getRedisClient } = await import('@/lib/redis');
        const redis = getRedisClient();
        await redis.del(`user_status:${uid}`);
      } catch {
        // Non-critical: cache will expire naturally in 60s
      }
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    logError('USER_MODERATION', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}
