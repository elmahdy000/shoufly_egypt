# Payment Gateway Setup Guide

## Overview

Shoofly supports three payment gateway options:

1. **Mock Gateway** (default) - For local development and testing
2. **Paymob** - Egypt's leading payment gateway
3. **Fawry** - Popular payment network in Egypt

---

## Quick Configuration

Set the following environment variables in your deployment platform:

```bash
# Payment Gateway Selection
PAYMENT_GATEWAY=mock  # Options: mock, paymob, fawry

# Paymob Configuration (when PAYMENT_GATEWAY=paymob)
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac_secret

# Fawry Configuration (when PAYMENT_GATEWAY=fawry)
FAWRY_MERCHANT_CODE=your_merchant_code
FAWRY_SECURITY_KEY=your_security_key
FAWRY_ENV=staging  # Options: staging, production
```

---

## Payment Flow

### 1. Wallet Top-up Flow

```
Client -> POST /api/client/wallet (action: topup)
       -> Create transaction record
       -> Get payment redirect URL based on gateway
       -> Redirect to payment page
       -> Payment gateway processes payment
       -> Webhook callback updates wallet balance
       -> Notification sent to client
```

### 2. Direct Order Payment Flow

```
Client -> POST /api/client/payments/request/[id]
       -> If sufficient balance: deduct & complete order
       -> If insufficient: create pending transaction
       -> Redirect to payment gateway
       -> Webhook processes payment
       -> Auto-pay the order
       -> Notifications sent to client & vendor
```

---

## API Endpoints

### Payment Initialization

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/client/wallet` | Top-up wallet (returns redirect URL) |
| POST | `/api/client/payments/request/[id]` | Pay for a request |
| GET | `/api/payments/paymob/initiate` | Initialize Paymob payment |
| GET | `/api/payments/fawry/initiate` | Initialize Fawry payment |

### Webhooks (For Payment Providers)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/webhook` | Universal webhook (mock/testing) |
| POST | `/api/payments/paymob/webhook` | Paymob webhook |
| POST | `/api/payments/fawry/webhook` | Fawry webhook |
| GET/POST | `/api/payments/fawry/webhook` | Fawry callback redirect |

---

## Paymob Setup

### 1. Create Paymob Account
- Sign up at [https://paymob.com](https://paymob.com)
- Complete business verification

### 2. Get API Credentials
- Go to Settings → API Keys
- Copy your **API Key**
- Create an **Integration** (Card payments)
- Copy the **Integration ID**
- Go to iframe settings, copy **Iframe ID**
- Generate and copy **HMAC Secret** for webhooks

### 3. Configure Webhook
In Paymob dashboard, set webhook URL to:
```
https://your-domain.com/api/payments/paymob/webhook
```

### 4. Set Environment Variables
```bash
PAYMENT_GATEWAY=paymob
PAYMOB_API_KEY=your_api_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac_secret
```

---

## Fawry Setup

### 1. Create Fawry Account
- Sign up at [https://fawry.com](https://fawry.com)
- Complete business verification

### 2. Get API Credentials
- Request merchant code and security key
- Access staging environment for testing

### 3. Configure Webhook
In Fawry dashboard, set webhook URL to:
```
https://your-domain.com/api/payments/fawry/webhook
```

Also configure the redirect URL:
```
https://your-domain.com/api/payments/fawry/webhook
```

### 4. Set Environment Variables
```bash
PAYMENT_GATEWAY=fawry
FAWRY_MERCHANT_CODE=your_merchant_code
FAWRY_SECURITY_KEY=your_security_key
FAWRY_ENV=production  # Use 'staging' for testing
```

---

## Security Considerations

### Webhook Signature Verification

All webhooks verify signatures in production:

- **Paymob**: HMAC-SHA512 signature verification
- **Fawry**: SHA256 signature verification
- **Mock**: No verification (for testing only)

### HTTPS Requirement

All payment flows require HTTPS in production. The payment gateways will reject non-HTTPS webhook URLs.

### Environment Variables

Never commit payment credentials to git. Use:
- Environment variables in deployment platform
- Secret management services (AWS Secrets Manager, etc.)

---

## Testing

### Test Card Numbers (Paymob Staging)

```
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: 123
```

### Test Card Numbers (Fawry Staging)

```
Card Number: 4532 1234 5678 9012
Expiry: Any future date
CVV: 123
```

### Mock Gateway (Local Development)

Use the mock gateway for local testing without real payments:

```bash
PAYMENT_GATEWAY=mock
```

The mock gateway simulates payment success/failure without actual transactions.

---

## Troubleshooting

### Webhook Not Receiving

1. Check webhook URL is HTTPS
2. Verify webhook signature configuration
3. Check server logs for webhook errors
4. Ensure transaction metadata is stored correctly

### Payment Not Processing

1. Verify API keys are correct
2. Check integration ID is active
3. Ensure currency is EGP
4. Check amount is in correct format (cents for Paymob)

### Balance Not Updating

1. Check webhook is being received
2. Verify transaction exists with correct metadata
3. Check for errors in webhook processing logs
4. Ensure depositFunds service is working

---

## Migration from Mock to Production

1. Set up payment gateway account
2. Configure environment variables
3. Deploy with `PAYMENT_GATEWAY=mock` first
4. Test the mock flow end-to-end
5. Switch to `PAYMENT_GATEWAY=paymob` or `fawry`
6. Test with small amount in staging
7. Go live with production credentials

---

## Support

For payment gateway specific issues:
- **Paymob**: support@paymob.com
- **Fawry**: merchant.support@fawry.com
