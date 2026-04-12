import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/utils/logger";

export async function failDeliveryAgent(params: {
  requestId: number;
  deliveryAgentId: number;
  reason?: string;
}) {
  const { requestId, deliveryAgentId, reason } = params;
  logger.info("delivery.agent.fail.started", { requestId, deliveryAgentId });

  return prisma.$transaction(async (tx: any) => {
    const request = await tx.request.findUnique({
      where: { id: requestId },
      select: { assignedDeliveryAgentId: true, status: true, clientId: true },
    });

    if (!request) throw new Error("Request not found");
    if (request.assignedDeliveryAgentId !== deliveryAgentId) {
      throw new Error("You are not assigned to this delivery");
    }

    const tracking = await tx.deliveryTracking.create({
      data: {
        requestId,
        status: "FAILED_DELIVERY",
        note: reason || "Delivery failed by delivery agent",
      },
    });

    await tx.request.update({
      where: { id: requestId },
      data: { assignedDeliveryAgentId: null, status: "CLOSED_CANCELLED" },
    });

    await tx.notification.create({
      data: {
        userId: request.clientId,
        type: "DELIVERY_FAILED",
        title: "Delivery Failed",
        message: `Delivery for request #${requestId} has failed. Admin will review for refund.`,
      },
    });

    const admins = await tx.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((a: { id: number }) => ({
          userId: a.id,
          type: "DELIVERY_FAILED",
          title: "FAILED DELIVERY - Refund Action Required",
          message: `Request #${requestId} failed delivery. Escrow funds need review.`,
        })),
      });
    }



    logger.info("delivery.agent.fail.completed", {
      requestId,
      deliveryAgentId,
    });
    return tracking;
  });
}
