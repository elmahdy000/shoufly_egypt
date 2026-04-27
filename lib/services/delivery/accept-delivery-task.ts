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

    if (!request) throw new Error("الطلب ده مش موجود.");
    if (request.status !== "ORDER_PAID_PENDING_DELIVERY") {
      throw new Error("معلش، الطلب ده مش متاح للتوصيل دلوقتي.");
    }
    if (request.assignedDeliveryAgentId) {
      throw new Error("المهمة دي راحت لمندوب تاني خلاص.");
    }
    
    // 🛡️ SECURITY SHIELD: Atomic Agent Assignment (Race-condition safe)
    const updateResult = await tx.request.updateMany({
      where: { id: requestId, assignedDeliveryAgentId: null },
      data: { assignedDeliveryAgentId: deliveryAgentId },
    });
    
    if (updateResult.count === 0) {
      throw new Error("نعتذر، لقد تم خطف هذه المهمة من قبل مندوب آخر للتو!");
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
  }, { timeout: 20000 });
}
