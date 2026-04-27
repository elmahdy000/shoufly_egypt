/**
 * Payment Gateway Configuration
 * Supports: Paymob, Fawry, and Mock Gateway (for testing)
 */

export const PAYMENT_GATEWAY = process.env.PAYMENT_GATEWAY || 'mock';

// Paymob Configuration
export const PAYMOB_CONFIG = {
  apiKey: process.env.PAYMOB_API_KEY || '',
  integrationId: process.env.PAYMOB_INTEGRATION_ID || '',
  iframeId: process.env.PAYMOB_IFRAME_ID || '',
  hmacSecret: process.env.PAYMOB_HMAC_SECRET || '',
  baseUrl: 'https://accept.paymob.com/api',
};

// Fawry Configuration  
export const FAWRY_CONFIG = {
  merchantCode: process.env.FAWRY_MERCHANT_CODE || '',
  securityKey: process.env.FAWRY_SECURITY_KEY || '',
  baseUrl: process.env.FAWRY_ENV === 'production' 
    ? 'https://atfawry.com/fawrypay-api/api' 
    : 'https://atfawry.fawrystaging.com/fawrypay-api/api',
};

// Determine which gateway to use
export function getPaymentGateway() {
  if (PAYMENT_GATEWAY === 'paymob' && PAYMOB_CONFIG.apiKey) {
    return 'paymob';
  }
  if (PAYMENT_GATEWAY === 'fawry' && FAWRY_CONFIG.merchantCode) {
    return 'fawry';
  }
  return 'mock';
}

// Get payment redirect URL
export function getPaymentRedirectUrl(transactionId: string, amount: number, requestId?: string): string {
  const gateway = getPaymentGateway();
  
  if (gateway === 'paymob') {
    return `/api/payments/paymob/initiate?txnId=${transactionId}&amount=${amount}&requestId=${requestId || ''}`;
  }
  
  if (gateway === 'fawry') {
    return `/api/payments/fawry/initiate?txnId=${transactionId}&amount=${amount}&requestId=${requestId || ''}`;
  }
  
  // Mock gateway for testing
  return `/payments/mock-gateway?txnId=${transactionId}&amount=${amount}&requestId=${requestId || ''}`;
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: any, 
  signature: string, 
  gateway: string
): boolean {
  if (gateway === 'paymob') {
    return verifyPaymobSignature(payload, signature);
  }
  if (gateway === 'fawry') {
    return verifyFawrySignature(payload, signature);
  }
  return true; // Mock always passes
}

function verifyPaymobSignature(payload: any, signature: string): boolean {
  // Official Paymob HMAC Algorithm (concatenated fields in specific order)
  // https://docs.paymob.com/docs/hmac-calculation
  const { obj } = payload;
  if (!obj) return false;

  const crypto = require('crypto');
  
  // The order of fields MUST be exact as per Paymob documentation
  const data = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order.id,
    obj.owner,
    obj.pending,
    obj.source_data.pan,
    obj.source_data.sub_type,
    obj.source_data.type,
    obj.success,
  ].join('');

  const hmac = crypto.createHmac('sha512', PAYMOB_CONFIG.hmacSecret);
  hmac.update(data);
  const calculated = hmac.digest('hex');
  return calculated === signature;
}

function verifyFawrySignature(payload: any, signature: string): boolean {
  // Implement Fawry signature verification
  // https://developer.fawrystaging.com/docs/signature-verification
  const crypto = require('crypto');
  const message = `${FAWRY_CONFIG.merchantCode}${payload.referenceNumber}${payload.paymentAmount}${FAWRY_CONFIG.securityKey}`;
  const hash = crypto.createHash('sha256').update(message).digest('hex');
  return hash === signature;
}
