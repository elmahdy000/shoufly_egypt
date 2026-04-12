import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { listAdminWithdrawals } from '@/lib/services/withdrawals';
import { fail, ok } from '@/lib/utils/http-response';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'ADMIN');

    const withdrawals = await listAdminWithdrawals();
    return ok(withdrawals);
  } catch (error) {
    return fail(error);
  }
}
