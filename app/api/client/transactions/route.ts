import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { listUserTransactions } from '@/lib/services/transactions';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'CLIENT');

    const transactions = await listUserTransactions(user.id);
    return NextResponse.json(transactions);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status =
      message === 'Forbidden'
        ? 403
        : message.includes('Unauthorized')
          ? 401
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}


