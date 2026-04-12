import { z } from 'zod';

export const DeliveryStatusSchema = z.enum([
  'ORDER_PLACED',
  'VENDOR_PREPARING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'IN_TRANSIT',
  'DELIVERED',
  'FAILED_DELIVERY',
  'RETURNED',
]);

export const DeliveryRouteParamSchema = z.object({
  requestId: z.coerce.number().int().positive(),
});

export const UpdateDeliveryStatusBodySchema = z.object({
  status: z.enum([
    'VENDOR_PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'IN_TRANSIT',
    'DELIVERED',
  ]),
  note: z.string().max(500).optional(),
  locationText: z.string().max(200).optional(),
});

export const MarkFailedDeliveryBodySchema = z.object({
  note: z.string().max(500).optional(),
  locationText: z.string().max(200).optional(),
});

export const MarkReturnedBodySchema = z.object({
  note: z.string().max(500).optional(),
  locationText: z.string().max(200).optional(),
});

export type DeliveryRouteParam = z.infer<typeof DeliveryRouteParamSchema>;
export type UpdateDeliveryStatusBody = z.infer<typeof UpdateDeliveryStatusBodySchema>;
export type MarkFailedDeliveryBody = z.infer<typeof MarkFailedDeliveryBodySchema>;
export type MarkReturnedBody = z.infer<typeof MarkReturnedBodySchema>;
