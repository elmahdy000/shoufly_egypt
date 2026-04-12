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
  // Implement Paymob HMAC verification
  // https://docs.paymob.com/docs/hmac-calculation
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha512', PAYMOB_CONFIG.hmacSecret);
  hmac.update(JSON.stringify(payload));
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
