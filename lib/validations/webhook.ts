import { z } from 'zod';

/**
 * Webhook payload validation schemas for payment gateways
 */

export const WebhookPayloadSchema = z.object({
  transactionId: z.union([z.number(), z.string()]),
  externalId: z.string().optional(),
  status: z.enum(['SUCCESS', 'FAILED', 'PENDING', 'CANCELLED']),
  amount: z.union([z.number(), z.string()]),
  idempotencyKey: z.string().optional(),
  timestamp: z.union([z.number(), z.string()]).optional(), // For replay attack protection
});

export type WebhookPayloadInput = z.infer<typeof WebhookPayloadSchema>;

/**
 * Paymob-specific webhook schema
 */
export const PaymobWebhookSchema = z.object({
  obj: z.object({
    id: z.number(),
    amount_cents: z.number(),
    created_at: z.string(),
    currency: z.string(),
    error_occured: z.boolean(),
    has_parent_transaction: z.boolean(),
    integration_id: z.number(),
    is_3d_secure: z.boolean(),
    is_auth: z.boolean(),
    is_capture: z.boolean(),
    is_refunded: z.boolean(),
    is_standalone_payment: z.boolean(),
    is_voided: z.boolean(),
    order: z.object({
      id: z.number(),
    }),
    owner: z.number(),
    pending: z.boolean(),
    source_data: z.object({
      pan: z.string(),
      sub_type: z.string(),
      type: z.string(),
    }),
    success: z.boolean(),
  }),
  hmac: z.string(),
});

export type PaymobWebhookInput = z.infer<typeof PaymobWebhookSchema>;

/**
 * Fawry-specific webhook schema
 */
export const FawryWebhookSchema = z.object({
  referenceNumber: z.string(),
  merchantCode: z.string(),
  paymentAmount: z.number(),
  paymentStatus: z.enum(['SUCCESS', 'FAILED', 'PENDING']),
  signature: z.string(),
});

export type FawryWebhookInput = z.infer<typeof FawryWebhookSchema>;
