import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/app/generated/prisma';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { getPaymentGateway, getPaymentRedirectUrl } from '@/lib/payments/config';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'CLIENT');

    const body = await req.json();
    const { action, amount } = body;

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'المبلغ غير صالح.' }, { status: 400 });
    }

    const decimalAmount = new Prisma.Decimal(parsedAmount);
    const provider = getPaymentGateway();

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.findUniqueOrThrow({
        where: { id: user.id },
      });

      if (action === 'withdraw') {
        const updateResult = await tx.user.updateMany({
          where: {
            id: user.id,
            walletBalance: { gte: decimalAmount },
          },
          data: { walletBalance: { decrement: decimalAmount } },
        });

        if (updateResult.count === 0) {
          throw new Error('الرصيد المتاح غير كافٍ للاسترداد أو تم تعديله في نفس اللحظة.');
        }

        const updatedUser = await tx.user.findUnique({ where: { id: user.id } });

        const transaction = await tx.transaction.create({
          data: {
            userId: user.id,
            amount: decimalAmount,
            type: 'WITHDRAWAL',
            description: 'استرداد مبالغ من المحفظة إلى البطاقة البنكية',
          },
        });

        return { user: updatedUser, transaction };
      }

      if (action === 'topup') {
        const transaction = await tx.transaction.create({
          data: {
            userId: user.id,
            amount: decimalAmount,
            type: 'WALLET_TOPUP',
            description: 'إيداع إلكتروني (انتظار التأكيد من بوابة الدفع)',
            metadata: {
              status: 'PENDING',
              provider,
              initiatedVia: 'wallet-topup',
              initiatedAt: new Date().toISOString(),
            },
          },
        });

        const redirectUrl = getPaymentRedirectUrl(
          String(transaction.id),
          parsedAmount
        );

        return {
          success: true,
          redirectUrl,
          transactionId: transaction.id,
          message: 'جاري تحويلك لبوابة الدفع الآمنة...',
        };
      }

      throw new Error('عملية مالية غير معروفة.');
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { walletBalance: true },
    });

    if (!freshUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      balance: Number(freshUser.walletBalance),
    });
  } catch {
    return NextResponse.json({ error: 'فشل استرجاع الرصيد' }, { status: 500 });
  }
}
