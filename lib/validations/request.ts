import { z } from 'zod';

export const CreateRequestSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  categoryId: z.coerce.number().int().positive(),
  address: z.string().min(5).max(200),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  deliveryPhone: z.string().regex(/^\+?[0-9\s\-()]{8,}$/),
  budget: z.coerce.number().positive().min(1).max(500000).optional(),
  notes: z.string().max(500).optional(),
  images: z.array(z.object({
    filePath: z.string(),
    fileName: z.string(),
    mimeType: z.string(),
    fileSize: z.number().int(),
  })).optional(),
});

export type CreateRequestInput = z.infer<typeof CreateRequestSchema>;

export const RequestIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const RequestStatusSchema = z.enum([
  'PENDING_ADMIN_REVISION',
  'OPEN_FOR_BIDDING',
  'BIDS_RECEIVED',
  'OFFERS_FORWARDED',
  'ORDER_PAID_PENDING_DELIVERY',
  'CLOSED_SUCCESS',
  'CLOSED_CANCELLED',
  'REJECTED',
]);

export type RequestStatusType = z.infer<typeof RequestStatusSchema>;
