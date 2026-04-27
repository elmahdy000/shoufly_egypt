import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { depositFunds } from '@/lib/services/transactions';
import { WebhookPayloadSchema } from '@/lib/validations/webhook';
import { validateWebhookTimestamp } from '@/lib/utils/error-handler';

/**
 * Universal Webhook handler for mock/simulation payments
 * For production, use specific handlers:
 * - /api/payments/paymob/webhook - Paymob payments
 * - /api/payments/fawry/webhook - Fawry payments
 */
export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json();
    logger.info('payment.webhook.received', { body });

    // Validate webhook payload using schema
    const validated = WebhookPayloadSchema.parse(body);

    const {
      transactionId,
      externalId,
      status,
      amount,
      idempotencyKey,
      timestamp
    } = validated;

    // 🛡️ Timestamp validation to prevent replay attacks
    if (!validateWebhookTimestamp(timestamp)) {
      logger.warn('payment.webhook.replay_attack_detected', { 
        transactionId, 
        timestamp,
        ip: req.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.json({ error: 'Webhook timestamp expired or invalid' }, { status: 400 });
    }

    const parsedTransactionId = Number.parseInt(String(transactionId), 10);
    const parsedAmount = Number(amount);

    if (!Number.isInteger(parsedTransactionId) || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payment payload' }, { status: 400 });
    }

    if (status !== 'SUCCESS') {
      logger.warn('payment.webhook.failed_status', { transactionId, status });
      return NextResponse.json({ received: true, status: 'failed_recorded' });
    }

    // Idempotency check: prevent duplicate processing
    if (idempotencyKey) {
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          metadata: {
            path: ['idempotencyKey'],
            equals: idempotencyKey
          }
        }
      });
      if (existingTransaction) {
        logger.info('payment.webhook.idempotency_duplicate', { idempotencyKey, transactionId: existingTransaction.id });
        return NextResponse.json({ success: true, received: true, alreadyProcessed: true });
      }
    }

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: parsedTransactionId },
      include: { user: true },
    });

    if (!transaction) {
      throw new Error('Transaction record not found');
    }

    const metadata = (transaction.metadata as Record<string, unknown> | null) || {};
    if (metadata.provider && metadata.provider !== 'mock') {
      return NextResponse.json({ error: 'Unsupported payment provider for mock webhook' }, { status: 400 });
    }

    const expectedAmount = Number(transaction.amount);
    if (Math.abs(expectedAmount - parsedAmount) > 0.009) {
      logger.warn('payment.webhook.amount_mismatch', {
        transactionId: transaction.id,
        expectedAmount,
        receivedAmount: parsedAmount,
      });
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Process using depositFunds service
    await depositFunds(transaction.userId, parsedAmount, transaction.id, idempotencyKey);

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
