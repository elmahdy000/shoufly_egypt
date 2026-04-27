import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/app/generated/prisma';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { getPaymentGateway, getPaymentRedirectUrl } from '@/lib/payments/config';
import { prisma } from '@/lib/prisma';
import { DepositFundsSchema } from '@/lib/validations/payment';
import { fail, ok } from '@/lib/utils/http-response';
import { checkRateLimit } from '@/lib/utils/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'CLIENT');

    // 🛡️ Rate limit: 3 deposit initiations per minute per user
    const { allowed, limit, remaining, resetTime } = await checkRateLimit(`wallet_deposit:${user.id}`, 3, 60000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'لقد تجاوزت الحد المسموح من طلبات الإيداع. يرجى الانتظار دقيقة.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(resetTime),
          },
        }
      );
    }

    const body = await req.json();
    const { amount } = DepositFundsSchema.parse(body);
    const decimalAmount = new Prisma.Decimal(amount);
    const provider = getPaymentGateway();

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: decimalAmount,
        type: 'WALLET_TOPUP',
        description: 'Wallet top-up pending payment confirmation',
        metadata: {
          status: 'PENDING',
          provider,
          initiatedVia: 'direct-deposit-endpoint',
          initiatedAt: new Date().toISOString(),
        },
      },
    });

    const result = {
      success: true,
      transactionId: transaction.id,
      redirectUrl: getPaymentRedirectUrl(String(transaction.id), Number(decimalAmount)),
      message: 'Redirecting to the configured payment gateway for confirmation.',
    };
    return ok(result);
  } catch (error: unknown) {
    return fail(error);
  }
}
