import { z } from 'zod';

export const PayRequestRouteParamSchema = z.object({
  requestId: z.coerce.number().int().positive(),
});

export const PayRequestBodySchema = z.object({
  requestId: z.coerce.number().int().positive().optional(),
  paymentNote: z.string().max(200).optional(),
});

export type PayRequestRouteParam = z.infer<typeof PayRequestRouteParamSchema>;
export type PayRequestBody = z.infer<typeof PayRequestBodySchema>;
 
export const DepositFundsSchema = z.object({
  amount: z.coerce.number().positive(),
});

export type DepositFundsInput = z.infer<typeof DepositFundsSchema>;



