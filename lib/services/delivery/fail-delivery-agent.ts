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
      data: { 
        assignedDeliveryAgentId: null,  // Remove assignment so another agent can take it
        status: "ORDER_PAID_PENDING_DELIVERY"  // Keep as paid/pending, not cancelled
      },
    });

    await tx.notification.create({
      data: {
        userId: request.clientId,
        type: "DELIVERY_FAILED",
        title: "Delivery Failed - Reassigning",
        message: `Delivery for request #${requestId} has failed. Another delivery agent will be assigned shortly.`,
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
          title: "Delivery Failed - Reassign Needed",
          message: `Request #${requestId} delivery failed. Reassign to new agent or review for refund if repeated failures occur.`,
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
