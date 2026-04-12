import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { depositFunds } from '@/lib/services/transactions';

/**
 * Universal Webhook handler for mock/simulation payments
 * For production, use specific handlers:
 * - /api/payments/paymob/webhook - Paymob payments
 * - /api/payments/fawry/webhook - Fawry payments
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    logger.info('payment.webhook.received', { body });

    const { 
      transactionId, // Reference from our system 
      externalId,    // ID from the payment provider 
      status, 
      amount 
    } = body;

    if (status !== 'SUCCESS') {
      logger.warn('payment.webhook.failed_status', { transactionId, status });
      return NextResponse.json({ received: true, status: 'failed_recorded' });
    }

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(transactionId) },
      include: { user: true },
    });

    if (!transaction) {
      throw new Error('Transaction record not found');
    }

    // Process using depositFunds service
    await depositFunds(transaction.userId, amount);

    // If this payment is linked to a request, Auto-Pay the request
    if (transaction.requestId) {
      logger.info('payment.webhook.auto_pay_request', { requestId: transaction.requestId });
      
      const { payRequest } = await import('@/lib/services/payments');
      
      try {
        await payRequest(transaction.requestId, transaction.userId);
        logger.info('payment.webhook.auto_pay_success', { requestId: transaction.requestId });
      } catch (payError: any) {
        logger.error('payment.webhook.auto_pay_failed', {
          requestId: transaction.requestId,
          error: payError.message,
        });
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    logger.error('payment.webhook.error', { error: error.message });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
