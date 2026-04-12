import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/utils/logger";

export async function acceptDeliveryTask(
  requestId: number,
  deliveryAgentId: number,
) {
  logger.info("delivery.task.accept.started", { requestId, deliveryAgentId });

  return prisma.$transaction(async (tx) => {
    const request = await tx.request.findUnique({
      where: { id: requestId },
      include: {
        deliveryTracking: {
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 1,
          select: { status: true },
        },
      },
    });

    if (!request) throw new Error("Request not found");
    if (request.status !== "ORDER_PAID_PENDING_DELIVERY") {
      throw new Error("Request is not available for delivery");
    }
    if (request.assignedDeliveryAgentId) {
      throw new Error("This delivery task is already assigned");
    }

    const lastStatus = request.deliveryTracking[0]?.status;
    if (lastStatus !== "READY_FOR_PICKUP") {
      throw new Error(
        `Vendor has not marked order ready yet (current: ${lastStatus ?? "none"})`,
      );
    }

    await tx.request.update({
      where: { id: requestId },
      data: { assignedDeliveryAgentId: deliveryAgentId },
    });

    const tracking = await tx.deliveryTracking.create({
      data: {
        requestId,
        status: "OUT_FOR_DELIVERY",
        note: "Delivery agent accepted and picked up the order",
      },
    });

    await tx.notification.create({
      data: {
        userId: request.clientId,
        type: "DELIVERY_UPDATE",
        title: "Delivery Agent Assigned",
        message: `A delivery agent is on the way for request #${requestId}.`,
      },
    });

    logger.info("delivery.task.accept.completed", {
      requestId,
      deliveryAgentId,
    });
    return tracking;
  });
}
