import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PAYMOB_CONFIG } from '@/lib/payments/config';
import { logger } from '@/lib/utils/logger';
import { checkRateLimit } from '@/lib/utils/rate-limiter';

/**
 * Initialize Paymob Payment
 * Step 1: Authenticate and get token
 * Step 2: Create order
 * Step 3: Generate payment key
 * Step 4: Return iframe URL
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'CLIENT');

    // 🛡️ Rate limit: 5 payment initiations per minute per user
    const { allowed, limit, remaining, resetTime } = await checkRateLimit(`paymob_initiate:${user.id}`, 5, 60000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'لقد تجاوزت الحد المسموح من طلبات الدفع. يرجى الانتظار دقيقة.' },
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

    const { searchParams } = new URL(req.url);
    const txnId = searchParams.get('txnId');
    const amount = searchParams.get('amount');
    const requestId = searchParams.get('requestId');

    if (!txnId || !amount) {
      return NextResponse.json({ error: 'Missing transaction ID or amount' }, { status: 400 });
    }

    const txnIdParsed = parseInt(txnId, 10);
    if (isNaN(txnIdParsed)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: txnIdParsed },
    });

    if (!transaction || transaction.userId !== user.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Step 1: Get auth token from Paymob
    const authResponse = await fetch(`${PAYMOB_CONFIG.baseUrl}/auth/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: PAYMOB_CONFIG.apiKey }),
    });

    const authData = await authResponse.json();
    if (!authData.token) {
      throw new Error('Failed to get Paymob auth token');
    }

    // Step 2: Create order
    const orderResponse = await fetch(`${PAYMOB_CONFIG.baseUrl}/ecommerce/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      },
      body: JSON.stringify({
        auth_token: authData.token,
        delivery_needed: false,
        amount_cents: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: 'EGP',
        items: [],
        merchant_order_id: txnId,
      }),
    });

    const orderData = await orderResponse.json();
    if (!orderData.id) {
      throw new Error('Failed to create Paymob order');
    }

    // Step 3: Generate payment key
    const paymentKeyResponse = await fetch(`${PAYMOB_CONFIG.baseUrl}/acceptance/payment_keys`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      },
      body: JSON.stringify({
        auth_token: authData.token,
        amount_cents: Math.round(parseFloat(amount) * 100),
        expiration: 3600,
        order_id: orderData.id,
        billing_data: {
          apartment: 'NA',
          email: user.email,
          floor: 'NA',
          first_name: user.fullName?.split(' ')[0] || 'Customer',
          street: 'NA',
          building: 'NA',
          phone_number: '+201000000000',
          shipping_method: 'NA',
          postal_code: 'NA',
          city: 'Cairo',
          country: 'EG',
          last_name: user.fullName?.split(' ').slice(1).join(' ') || 'NA',
          state: 'Cairo',
        },
        currency: 'EGP',
        integration_id: parseInt(PAYMOB_CONFIG.integrationId),
      }),
    });

    const paymentKeyData = await paymentKeyResponse.json();
    if (!paymentKeyData.token) {
      throw new Error('Failed to generate Paymob payment key');
    }

    // Update transaction with Paymob order ID
    await prisma.transaction.update({
      where: { id: txnIdParsed },
      data: {
        metadata: { 
          ...((transaction.metadata as Record<string, unknown> | null) || {}),
          status: 'PENDING',
          provider: 'paymob',
          paymobOrderId: orderData.id,
          paymobPaymentKey: paymentKeyData.token,
        },
      },
    });

    // Step 4: Return iframe URL
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_CONFIG.iframeId}?payment_token=${paymentKeyData.token}`;

    logger.info('payment.paymob.initiated', {
      transactionId: txnId,
      paymobOrderId: orderData.id,
      userId: user.id,
    });

    return NextResponse.json({ 
      success: true, 
      redirectUrl: iframeUrl,
      paymentToken: paymentKeyData.token,
    });

  } catch (error: any) {
    logger.error('payment.paymob.initiate_error', { error: error.message });
    return NextResponse.json(
      {
        error: 'Failed to initiate payment',
        ...(process.env.NODE_ENV !== 'production' && { details: error.message }),
      },
      { status: 500 }
    );
  }
}
