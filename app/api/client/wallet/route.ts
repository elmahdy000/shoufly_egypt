import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma';
import { getPaymentRedirectUrl } from '@/lib/payments/config';

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

    const result = await prisma.$transaction(async (tx) => {
      // Refresh User Model to prevent race conditions
      const freshUser = await tx.user.findUniqueOrThrow({
        where: { id: user.id }
      });

      if (action === 'withdraw') {
        // Atomic decrement with balance check at database level
        const updateResult = await tx.user.updateMany({
          where: { 
            id: user.id,
            walletBalance: { gte: decimalAmount }
          },
          data: { walletBalance: { decrement: decimalAmount } }
        });
        
        if (updateResult.count === 0) {
          throw new Error('الرصيد المتاح غير كافٍ للاسترداد أو تم تعديله في نفس اللحظة.');
        }

        // Refetch user since updateMany doesn't return the updated record
        const updatedUser = await tx.user.findUnique({ where: { id: user.id } });

        const transaction = await tx.transaction.create({
          data: {
            userId: user.id,
            amount: decimalAmount,
            type: 'WITHDRAWAL', // Representing refund/withdrawal for client
            description: 'استرداد مبالغ من المحفظة إلى البطاقة البنكية'
          }
        });

        return { user: updatedUser, transaction };
      } 
      
      if (action === 'topup') {
        const transaction = await tx.transaction.create({
          data: {
            userId: user.id,
            amount: decimalAmount,
            type: 'WALLET_TOPUP', 
            description: 'إيداع إلكتروني (انتظار التأكيد من بوابة الدفع)'
          }
        });

        // Get redirect URL based on configured payment gateway
        const redirectUrl = getPaymentRedirectUrl(
          String(transaction.id), 
          parsedAmount
        );
        
        return { 
          success: true, 
          redirectUrl,
          transactionId: transaction.id,
          message: 'جاري تحويلك لبوابة الدفع الآمنة...'
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
