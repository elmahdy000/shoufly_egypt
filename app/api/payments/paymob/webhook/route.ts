import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PAYMOB_CONFIG, verifyWebhookSignature } from '@/lib/payments/config';
import { logger } from '@/lib/utils/logger';
import { depositFunds } from '@/lib/services/transactions';
import { validateWebhookTimestamp } from '@/lib/utils/error-handler';

/**
 * Paymob Webhook Handler
 * Receives payment status updates from Paymob
 * https://docs.paymob.com/docs/webhooks
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('hmac') || '';

    logger.info('payment.paymob.webhook.received', { body });

    // Verify webhook signature for security
    const isValid = verifyWebhookSignature(body, signature, 'paymob');
    if (!isValid && (process.env.NODE_ENV === 'production' || !!PAYMOB_CONFIG.hmacSecret)) {
      logger.warn('payment.paymob.webhook.invalid_signature', { signature });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 🛡️ Timestamp validation to prevent replay attacks (Paymob uses created_at)
    const paymobTimestamp = body.obj?.created_at;
    if (!validateWebhookTimestamp(paymobTimestamp)) {
      logger.warn('payment.paymob.webhook.replay_attack_detected', { 
        transactionId: body.order?.merchant_order_id,
        timestamp: paymobTimestamp,
        ip: req.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.json({ error: 'Webhook timestamp expired or invalid' }, { status: 400 });
    }

    const {
      order,
      payment_key_claims,
      obj: transactionData,
    } = body;

    // Extract data from Paymob webhook
    const paymobOrderId = order?.id;
    const transactionId = order?.merchant_order_id;
    const paymentStatus = transactionData?.success ? 'SUCCESS' : 'FAILED';
    const amount = transactionData?.amount_cents ? transactionData.amount_cents / 100 : 0;

    if (!transactionId) {
      logger.error('payment.paymob.webhook.missing_transaction_id', { body });
      return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
    }

    // Find our transaction record
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: parseInt(transactionId),
        metadata: {
          path: ['paymobOrderId'],
          equals: paymobOrderId,
        },
      },
      include: { user: true },
    });

    if (!transaction) {
      logger.error('payment.paymob.webhook.transaction_not_found', { transactionId, paymobOrderId });
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Only process successful payments
    if (paymentStatus !== 'SUCCESS') {
      logger.warn('payment.paymob.webhook.failed_payment', {
        transactionId,
        status: paymentStatus,
      });

      // Update transaction status
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          metadata: {
            ...(transaction.metadata as object || {}),
            paymobStatus: paymentStatus,
            paymobTransactionId: transactionData?.id,
            failureReason: transactionData?.data?.message,
          },
        },
      });

      return NextResponse.json({ received: true, status: 'failed_recorded' });
    }

    // IDEMPOTENCY GUARD: Skip if already processed to prevent double-crediting
    const meta = transaction.metadata as Record<string, unknown> | null;
    if (meta?.paymobStatus === 'SUCCESS') {
      logger.warn('payment.paymob.webhook.already_processed', { transactionId });
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    const expectedAmount = Number(transaction.amount);
    if (Math.abs(expectedAmount - amount) > 0.009) {
      logger.warn('payment.paymob.webhook.amount_mismatch', {
        transactionId: transaction.id,
        expectedAmount,
        receivedAmount: amount,
      });
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Process successful payment
    logger.info('payment.paymob.webhook.success', {
      transactionId: transaction.id,
      userId: transaction.userId,
      amount,
    });

    // Use depositFunds service to add balance and notify user
    // PASSING transaction.id here ensures we update the existing record instead of creating a duplicate!
    await depositFunds(transaction.userId, amount, transaction.id);

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        metadata: {
          ...(meta || {}),
          status: 'SUCCESS',
          paymobStatus: 'SUCCESS',
          paymobTransactionId: transactionData?.id,
          processedAt: new Date().toISOString(),
        },
      },
    });

    // If this transaction is linked to a request, auto-pay it
    if (transaction.requestId) {
      logger.info('payment.paymob.webhook.auto_pay_request', {
        requestId: transaction.requestId,
      });

      // Import payRequest dynamically to avoid circular dependency
      const { payRequest } = await import('@/lib/services/payments');
      
      try {
        await payRequest(transaction.requestId, transaction.userId);
        logger.info('payment.paymob.webhook.auto_pay_success', {
          requestId: transaction.requestId,
        });
      } catch (payError: any) {
        logger.error('payment.paymob.webhook.auto_pay_failed', {
          requestId: transaction.requestId,
          error: payError.message,
        });
        // Don't fail the webhook if auto-pay fails - user has balance now
      }
    }

    return NextResponse.json({ success: true, received: true });

  } catch (error: any) {
    logger.error('payment.paymob.webhook.error', { error: error.message, stack: error.stack });
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}
