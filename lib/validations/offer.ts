import { z } from 'zod';

export const AcceptOfferSchema = z.object({
  bidId: z.coerce.number().int().positive(),
});

export type AcceptOfferInput = z.infer<typeof AcceptOfferSchema>;

export const OfferRequestRouteParamSchema = z.object({
  requestId: z.coerce.number().int().positive(),
});

export const OfferBidRouteParamSchema = z.object({
  bidId: z.coerce.number().int().positive(),
});
