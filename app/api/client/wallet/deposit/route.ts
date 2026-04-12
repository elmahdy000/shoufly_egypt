import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { depositFunds } from '@/lib/services/transactions';
import { DepositFundsSchema } from '@/lib/validations/payment';
import { fail, ok } from '@/lib/utils/http-response';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'CLIENT');

    const body = await req.json();
    const { amount } = DepositFundsSchema.parse(body);

    const result = await depositFunds(user.id, amount);
    return ok(result);
  } catch (error: unknown) {
    return fail(error);
  }
}
