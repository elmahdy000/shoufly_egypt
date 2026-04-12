import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * Webhook handler to receive payment confirmations from external gateways (Fawry/Paymob/etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    logger.info('payment.webhook.received', { body });

    // TODO: Verify Signature/Hash here based on the provider (Security)
    
    const { 
      transactionId, // Reference from our system 
      externalId,    // ID from the payment provider 
      status, 
      amount 
    } = body;

    if (status !== 'SUCCESS') {
      logger.warn('payment.webhook.failed_status', { transactionId, status });
      return NextResponse.json({ received: true });
    }

    // Process the successful payment atomically
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: { id: parseInt(transactionId) },
        include: { user: true }
      });

      if (!transaction) throw new Error('Transaction record not found');

      // 1. Update the user balance (Deposit the funds)
      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          walletBalance: { increment: amount }
        }
      });

      // 2. If this payment is linked to a request, Auto-Pay the request
      if (transaction.requestId) {
        logger.info('payment.webhook.auto_pay_request', { requestId: transaction.requestId });
        // We'll call payRequest logic manually in this transaction or via service
        // Since we are already in a transaction, we should use the same 'tx'
        // For simplicity in this mock, we assume user now has enough balance
      }

      // 3. Notify the user
      await tx.notification.create({
        data: {
          userId: transaction.userId,
          type: 'WALLET_TOPUP',
          title: 'تم السداد بنجاح',
          message: transaction.requestId 
            ? `تم استلام دفعتك للأوردر #${transaction.requestId} بنجاح.` 
            : `تم إضافة مبلغ ${amount} ج.م لمحفظتك بنجاح.`,
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('payment.webhook.error', { error: error.message });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
