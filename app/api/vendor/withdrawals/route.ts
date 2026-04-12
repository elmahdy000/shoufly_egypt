import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { listVendorWithdrawals, requestWithdrawal } from '@/lib/services/withdrawals';
import { RequestWithdrawalBodySchema } from '@/lib/validations/withdrawal';
import { fail, ok } from '@/lib/utils/http-response';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const body = RequestWithdrawalBodySchema.parse(await req.json());
    const result = await requestWithdrawal(user.id, body.amount);
    return ok(result, 201);
  } catch (error) {
    return fail(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const result = await listVendorWithdrawals(user.id);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
