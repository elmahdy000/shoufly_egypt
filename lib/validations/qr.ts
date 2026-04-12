import { z } from "zod";

export const ConfirmDeliveryRouteParamSchema = z.object({
  requestId: z.coerce.number().int().positive(),
});

export const ConfirmDeliveryBodySchema = z.object({
  qrCode: z.string().min(3).max(255).optional(),
});

export type ConfirmDeliveryRouteParam = z.infer<
  typeof ConfirmDeliveryRouteParamSchema
>;
export type ConfirmDeliveryBody = z.infer<typeof ConfirmDeliveryBodySchema>;
