import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { listUserTransactions } from '@/lib/services/transactions';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const transactions = await listUserTransactions(user.id, limit, offset);
    return NextResponse.json(transactions);
  } catch (error: unknown) {
    logError('VENDOR_TRANSACTIONS_GET', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}
