import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { withdrawalSchema } from '@/lib/validations/schemas';
import { requestWithdrawal, listVendorWithdrawals } from '@/lib/services/withdrawals';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const withdrawals = await listVendorWithdrawals(user.id);
    return NextResponse.json(withdrawals);
  } catch (error: any) {
    logError('WITHDRAWAL_GET_ERROR', error);
    const { response, status } = createErrorResponse(error);
    return NextResponse.json(response, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const body = await req.json();
    
    // 🛡️ Ensure amount is valid (number, > 50, etc.)
    const { amount } = await withdrawalSchema.parseAsync(body);

    const withdrawal = await requestWithdrawal(user.id, amount);
    
    return NextResponse.json(withdrawal, { status: 201 });

  } catch (error: any) {
    logError('WITHDRAWAL_POST_ERROR', error);
    const { response, status } = createErrorResponse(error);
    return NextResponse.json(response, { status });
  }
}
