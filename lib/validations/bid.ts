import { z } from 'zod';

export const CreateBidSchema = z.object({
  requestId: z.coerce.number().int().positive(),
  description: z.string().min(10).max(500),
  netPrice: z.coerce.number().positive(),
  images: z.array(z.string()).optional(),
});

export type CreateBidInput = z.infer<typeof CreateBidSchema>;

export const BidStatusSchema = z.enum([
  'PENDING',
  'SELECTED',
  'ACCEPTED_BY_CLIENT',
  'REJECTED',
  'WITHDRAWN',
]);

export type BidStatusType = z.infer<typeof BidStatusSchema>;
