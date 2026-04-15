import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FAWRY_CONFIG } from '@/lib/payments/config';
import { logger } from '@/lib/utils/logger';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

/**
 * Initialize Fawry Payment
 * Creates a Fawry payment link or QR code
 * https://developer.fawrystaging.com/docs/card-wallet-integrations/pay-using-card
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'CLIENT');

    const { searchParams } = new URL(req.url);
    const txnId = searchParams.get('txnId');
    const amount = searchParams.get('amount');
    const requestId = searchParams.get('requestId');

    if (!txnId || !amount) {
      return NextResponse.json({ error: 'Missing transaction ID or amount' }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(txnId) },
    });

    if (!transaction || transaction.userId !== user.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Get full user details including phone
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, phone: true },
    });

    const referenceNumber = `SHOOFLY-${txnId}-${Date.now()}`;
    const amountVal = parseFloat(amount).toFixed(2);

    // Build Fawry signature
    const crypto = require('crypto');
    const signatureString = `${FAWRY_CONFIG.merchantCode}${referenceNumber}${amountVal}${FAWRY_CONFIG.securityKey}`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    // Create Fawry charge request
    const fawryPayload = {
      merchantCode: FAWRY_CONFIG.merchantCode,
      merchantRefNum: referenceNumber,
      customerMobile: fullUser?.phone || '',
      customerEmail: user.email,
      paymentAmount: parseFloat(amountVal),
      paymentMethod: 'CARD', // or 'MWALLET' for mobile wallet
      description: requestId 
        ? `Payment for Shoofly Order #${requestId}`
        : `Shoofly Wallet Top-up`,
      signature,
    };

    // Store reference number in transaction
    await prisma.transaction.update({
      where: { id: parseInt(txnId) },
      data: {
        metadata: {
          fawryReferenceNumber: referenceNumber,
          fawryMerchantRefNum: referenceNumber,
        },
      },
    });

    // Fawry payment URL (redirect or iframe)
    const isProduction = FAWRY_CONFIG.baseUrl.includes('atfawry.com');
    const fawryPayUrl = isProduction
      ? `https://www.atfawry.com/pay?merchantCode=${FAWRY_CONFIG.merchantCode}&merchantRefNum=${referenceNumber}`
      : `https://atfawry.fawrystaging.com/fawrypay-api/pay?merchantCode=${FAWRY_CONFIG.merchantCode}&merchantRefNum=${referenceNumber}`;

    logger.info('payment.fawry.initiated', {
      transactionId: txnId,
      referenceNumber,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      redirectUrl: fawryPayUrl,
      referenceNumber,
      amount: amountVal,
    });

  } catch (error: unknown) {
    logError('FAWRY_INITIATE', error);
    logger.error('payment.fawry.initiate_error', { error: error instanceof Error ? error.message : 'Unknown error' });
    const { response, status } = createErrorResponse(error, 500);
    return NextResponse.json(response, { status });
  }
}
