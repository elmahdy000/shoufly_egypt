import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { createRefund } from '@/lib/services/refunds';
import { CreateRefundBodySchema, RefundRouteParamSchema } from '@/lib/validations/refund';
import { fail, ok } from '@/lib/utils/http-response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'ADMIN');

    const routeParams = RefundRouteParamSchema.parse(await params);
    const body = CreateRefundBodySchema.parse(await req.json().catch(() => ({})));

    const result = await createRefund({
      requestId: routeParams.requestId,
      adminId: user.id,
      reason: body.reason,
    });

    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
