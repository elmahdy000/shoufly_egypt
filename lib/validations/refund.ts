import { z } from 'zod';

export const RefundRouteParamSchema = z.object({
  requestId: z.coerce.number().int().positive(),
});

export const CreateRefundBodySchema = z.object({
  reason: z.string().max(500).optional(),
});

export type RefundRouteParam = z.infer<typeof RefundRouteParamSchema>;
export type CreateRefundBody = z.infer<typeof CreateRefundBodySchema>;
