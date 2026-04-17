import { prisma } from "../../prisma";
import { logger } from "../../utils/logger";
import { Notify } from "../notifications/hub";

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
    
    // 🛡️ SECURITY SHIELD: Atomic Agent Assignment (Race-condition safe)
    const updateResult = await tx.request.updateMany({
      where: { id: requestId, assignedDeliveryAgentId: null },
      data: { assignedDeliveryAgentId: deliveryAgentId },
    });

    if (updateResult.count === 0) {
      throw new Error("This delivery task has just been taken by another agent");
    }

    const tracking = await tx.deliveryTracking.create({
      data: {
        requestId,
        status: "OUT_FOR_DELIVERY",
        note: "Delivery agent accepted and picked up the order",
      },
    });

    // Real-time Notification
    await Notify.deliveryUpdate(request.clientId, requestId, "OUT_FOR_DELIVERY");

    logger.info("delivery.task.accept.completed", {
      requestId,
      deliveryAgentId,
    });

    return tracking;
  });
}
