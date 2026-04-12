import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { listAdminTransactions } from '@/lib/services/transactions';
import { fail, ok } from '@/lib/utils/http-response';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'ADMIN');

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const transactions = await listAdminTransactions(limit, offset);
    return ok(transactions);

  } catch (error) {
    return fail(error);
  }
}
