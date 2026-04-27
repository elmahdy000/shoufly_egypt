import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/utils/logger";
import { Notify } from "../notifications/hub";

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
    if (request.status !== "ORDER_PAID_PENDING_DELIVERY") {
      throw new Error('لا يمكن الإبلاغ عن فشل التوصيل لطلب في حالته الحالية.');
    }
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

    await Notify.send({
      userId: request.clientId,
      type: "DELIVERY_FAILED",
      title: "تعذر التوصيل - جاري تعيين مندوب آخر 🚚",
      message: `نعتذر، تعذر على المندوب الحالي توصيل الطلب رقم #${requestId}. سنقوم بتعيين مندوب آخر فوراً.`,
      requestId,
    }, tx);

    const admins = await tx.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (admins.length > 0) {
      await Notify.bulkSend(admins.map((a: { id: number }) => ({
        userId: a.id,
        type: "DELIVERY_FAILED",
        title: "فشل توصيل بواسطة مندوب 🚨",
        message: `الطلب رقم #${requestId} فشل توصيله بواسطة المندوب #${deliveryAgentId}. يرجى المتابعة.`,
        requestId,
      })), tx);
    }



    logger.info("delivery.agent.fail.completed", {
      requestId,
      deliveryAgentId,
    });
    return tracking;
  });
}
