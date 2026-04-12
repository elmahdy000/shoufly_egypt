import { prisma } from "@/lib/prisma";
import { settleOrder } from "@/lib/services/transactions/settle-order";
import { logger } from "@/lib/utils/logger";

const CONFIRMABLE_DELIVERY_STATES = new Set([
  "OUT_FOR_DELIVERY",
  "IN_TRANSIT",
  "DELIVERED",
]);

export async function confirmDelivery(params: {
  requestId: number;
  clientId: number;
  qrCode?: string;
}) {
  const { requestId, clientId, qrCode } = params;
  logger.info("qr.confirm.started", { requestId, clientId });

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      deliveryTracking: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 1,
        select: { status: true },
      },
    },
  });

  if (!request) {
    logger.warn("qr.confirm.request_not_found", { requestId, clientId });
    throw new Error("Request not found");
  }

  if (request.clientId !== clientId) {
    logger.warn("qr.confirm.forbidden_owner", { requestId, clientId });
    throw new Error("Forbidden");
  }

  if (request.status !== "ORDER_PAID_PENDING_DELIVERY") {
    throw new Error(
      `Request is in status ${request.status}, cannot confirm delivery`,
    );
  }

  if (qrCode) {
    if (!request.qrCode || request.qrCode !== qrCode) {
      logger.warn("qr.confirm.invalid_code", { requestId, clientId });
      throw new Error("Invalid QR code");
    }
  }

  const lastDeliveryStatus = request.deliveryTracking[0]?.status;
  if (
    !lastDeliveryStatus ||
    !CONFIRMABLE_DELIVERY_STATES.has(lastDeliveryStatus)
  ) {
    logger.warn("qr.confirm.invalid_delivery_state", {
      requestId,
      clientId,
      deliveryStatus: lastDeliveryStatus || null,
    });
    throw new Error(
      `Delivery is not in confirmable state (${lastDeliveryStatus || "none"})`,
    );
  }

  logger.info("qr.confirm.completed", { requestId, clientId });
  return settleOrder(requestId);
}
