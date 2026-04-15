import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { reviewWithdrawal } from '@/lib/services/withdrawals';
import { ReviewWithdrawalBodySchema, WithdrawalRouteParamSchema } from '@/lib/validations/withdrawal';
import { fail, ok } from '@/lib/utils/http-response';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ withdrawalId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'ADMIN');

    const routeParams = WithdrawalRouteParamSchema.parse(await params);
    const body = ReviewWithdrawalBodySchema.parse(await req.json());

    const result = await reviewWithdrawal({
      withdrawalId: routeParams.withdrawalId,
      adminId: user.id,
      action: body.action,
      reviewNote: body.reviewNote,
    });

    return ok(result);
  } catch (error: unknown) {
    logError('WITHDRAWAL_REVIEW', error);
    const { response, status } = createErrorResponse(error, 400);
    return fail(response);
  }
}
