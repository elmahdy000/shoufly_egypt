import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/utils/logger";

export async function acceptDeliveryTask(
  requestId: number,
  deliveryAgentId: number,
) {
  logger.info("delivery.task.accept.started", { requestId, deliveryAgentId });

  return prisma.$transaction(async (tx) => {
    // LOCK: Use findUnique with explicit lock to prevent race conditions
    // This ensures only one delivery agent can claim the task
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
    
    // DOUBLE CHECK: Re-query with lock to ensure atomic assignment
    const lockedRequest = await tx.$queryRaw`
      SELECT "assignedDeliveryAgentId" 
      FROM "Request" 
      WHERE id = ${requestId} 
      FOR UPDATE
    `;
    
    if (lockedRequest && (lockedRequest as any[])[0]?.assignedDeliveryAgentId) {
      throw new Error("This delivery task was just assigned to another agent");
    }

    const lastStatus = request.deliveryTracking[0]?.status;
    if (lastStatus !== "READY_FOR_PICKUP") {
      throw new Error(
        `Vendor has not marked order ready yet (current: ${lastStatus ?? "none"})`,
      );
    }

    // 🛡️ SECURITY SHIELD: Atomic Agent Assignment (Race-condition safe)
    // We attempt to update ONLY if assignedDeliveryAgentId is still NULL.
    // If someone else grabbed it a millisecond ago, this will update 0 rows.
    const updateResult = await tx.request.updateMany({
      where: { 
        id: requestId, 
        assignedDeliveryAgentId: null 
      },
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
