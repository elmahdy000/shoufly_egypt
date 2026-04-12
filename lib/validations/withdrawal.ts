import { z } from 'zod';

export const WithdrawalRouteParamSchema = z.object({
  withdrawalId: z.coerce.number().int().positive(),
});

export const RequestWithdrawalBodySchema = z.object({
  amount: z.coerce.number().positive(),
});

export const ReviewWithdrawalBodySchema = z.object({
  action: z.enum(['approve', 'reject']),
  reviewNote: z.string().max(500).optional(),
});

export type WithdrawalRouteParam = z.infer<typeof WithdrawalRouteParamSchema>;
export type RequestWithdrawalBody = z.infer<typeof RequestWithdrawalBodySchema>;
export type ReviewWithdrawalBody = z.infer<typeof ReviewWithdrawalBodySchema>;
