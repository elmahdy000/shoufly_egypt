import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FAWRY_CONFIG, verifyWebhookSignature } from '@/lib/payments/config';
import { logger } from '@/lib/utils/logger';
import { depositFunds } from '@/lib/services/transactions';

/**
 * Fawry Webhook Handler
 * Receives payment status updates from Fawry
 * https://developer.fawrystaging.com/docs/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Fawry signature is typically in headers or body
    const signature = req.headers.get('x-fawry-signature') || body.signature || '';

    logger.info('payment.fawry.webhook.received', { body });

    // Verify webhook signature for security
    const isValid = verifyWebhookSignature(body, signature, 'fawry');
    if (!isValid && process.env.NODE_ENV === 'production') {
      logger.warn('payment.fawry.webhook.invalid_signature', { signature });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const {
      referenceNumber,
      merchantRefNumber,
      paymentAmount,
      paymentStatus,
      paymentMethod,
      fawryRefNumber,
    } = body;

    if (!merchantRefNumber) {
      logger.error('payment.fawry.webhook.missing_ref', { body });
      return NextResponse.json({ error: 'Missing merchant reference number' }, { status: 400 });
    }

    // Extract transaction ID from merchant reference (format: SHOOFLY-{txnId}-{timestamp})
    const txnIdMatch = merchantRefNumber.match(/SHOOFLY-(\d+)-/);
    const transactionId = txnIdMatch ? parseInt(txnIdMatch[1]) : null;

    if (!transactionId) {
      logger.error('payment.fawry.webhook.invalid_ref_format', { merchantRefNumber });
      return NextResponse.json({ error: 'Invalid merchant reference format' }, { status: 400 });
    }

    // Find our transaction record
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        metadata: {
          path: ['fawryReferenceNumber'],
          equals: referenceNumber,
        },
      },
      include: { user: true },
    });

    if (!transaction) {
      // Try finding by ID only as fallback
      const fallbackTxn = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true },
      });
      
      if (!fallbackTxn) {
        logger.error('payment.fawry.webhook.transaction_not_found', { transactionId, referenceNumber });
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }
    }

    const txn = transaction!;

    // Check if already processed
    const currentMetadata = (txn.metadata as any) || {};
    if (currentMetadata.fawryStatus === 'PAID') {
      logger.info('payment.fawry.webhook.already_processed', { transactionId });
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    // Only process successful payments
    if (paymentStatus !== 'PAID' && paymentStatus !== 'SUCCESS') {
      logger.warn('payment.fawry.webhook.failed_payment', {
        transactionId,
        status: paymentStatus,
      });

      // Update transaction status
      await prisma.transaction.update({
        where: { id: txn.id },
        data: {
          metadata: {
            ...currentMetadata,
            fawryStatus: paymentStatus,
            fawryRefNumber,
            failureReason: body.statusDescription || body.failureReason,
            updatedAt: new Date().toISOString(),
          },
        },
      });

      return NextResponse.json({ received: true, status: 'failed_recorded' });
    }

    // Process successful payment
    logger.info('payment.fawry.webhook.success', {
      transactionId: txn.id,
      userId: txn.userId,
      amount: paymentAmount,
      fawryRefNumber,
    });

    // Use depositFunds service to add balance and notify user
    await depositFunds(txn.userId, parseFloat(paymentAmount));

    // If this transaction is linked to a request, auto-pay it
    if (txn.requestId) {
      logger.info('payment.fawry.webhook.auto_pay_request', {
        requestId: txn.requestId,
      });

      // Import payRequest dynamically to avoid circular dependency
      const { payRequest } = await import('@/lib/services/payments');
      
      try {
        await payRequest(txn.requestId, txn.userId);
        logger.info('payment.fawry.webhook.auto_pay_success', {
          requestId: txn.requestId,
        });
      } catch (payError: any) {
        logger.error('payment.fawry.webhook.auto_pay_failed', {
          requestId: txn.requestId,
          error: payError.message,
        });
        // Don't fail the webhook if auto-pay fails - user has balance now
      }
    }

    // Update transaction with success status
    await prisma.transaction.update({
      where: { id: txn.id },
      data: {
        metadata: {
          ...currentMetadata,
          fawryStatus: 'PAID',
          fawryRefNumber,
          paymentMethod,
          processedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ success: true, received: true });

  } catch (error: any) {
    logger.error('payment.fawry.webhook.error', { error: error.message, stack: error.stack });
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Fawry also supports GET webhook/callback for browser redirects
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const merchantRefNumber = searchParams.get('merchantRefNum');
  const paymentStatus = searchParams.get('paymentStatus');
  const statusCode = searchParams.get('statusCode');

  logger.info('payment.fawry.callback.received', {
    merchantRefNumber,
    paymentStatus,
    statusCode,
  });

  // Redirect to appropriate page based on status
  if (paymentStatus === 'PAID' || statusCode === '200') {
    // Successful payment - redirect to wallet or request page
    return NextResponse.redirect(new URL('/client/wallet?success=true', req.url));
  } else {
    // Failed payment
    return NextResponse.redirect(new URL('/client/wallet?error=payment_failed', req.url));
  }
}
