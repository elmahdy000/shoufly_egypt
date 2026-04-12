import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/utils/logger";

export async function completeDeliveryAgent(
  requestId: number,
  deliveryAgentId: number,
) {
  logger.info("delivery.agent.complete.started", {
    requestId,
    deliveryAgentId,
  });

  return prisma.$transaction(async (tx) => {
    const request = await tx.request.findUnique({
      where: { id: requestId },
      select: { assignedDeliveryAgentId: true, status: true, clientId: true },
    });

    if (!request) throw new Error("Request not found");
    if (request.assignedDeliveryAgentId !== deliveryAgentId) {
      throw new Error("You are not assigned to this delivery");
    }
    if (request.status !== "ORDER_PAID_PENDING_DELIVERY") {
      throw new Error("Request is not in a deliverable state");
    }

    const tracking = await tx.deliveryTracking.create({
      data: {
        requestId,
        status: "DELIVERED",
        note: "Delivered by delivery agent — awaiting client confirmation",
      },
    });

    await tx.notification.create({
      data: {
        userId: request.clientId,
        type: "DELIVERY_UPDATE",
        title: "Order Delivered",
        message: `Your order #${requestId} has been delivered. Please confirm receipt.`,
      },
    });

    logger.info("delivery.agent.complete.completed", {
      requestId,
      deliveryAgentId,
    });
    return { requestId, status: "DELIVERED", trackingId: tracking.id };
  });
}
