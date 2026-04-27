import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/utils/logger";
import { settleOrder } from "../transactions/settle-order";

export async function completeDeliveryAgent(
  requestId: number,
  deliveryAgentId: number,
  qrCode: string // 🔒 PROOF OF DELIVERY: Required for confirmation
) {
  logger.info("delivery.agent.complete.started", {
    requestId,
    deliveryAgentId,
  });

  // --- INITIAL SECURITY & LOGIC GUARDS ---
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    select: { assignedDeliveryAgentId: true, status: true, clientId: true, qrCode: true },
  });

  if (!request) throw new Error("الطلب غير موجود.");
  
  if (request.assignedDeliveryAgentId !== deliveryAgentId) {
    throw new Error("أنت غير مخصص لهذه عملية التوصيل.");
  }

  if (request.status !== "ORDER_PAID_PENDING_DELIVERY") {
    throw new Error("الطلب ليس في مرحلة التوصيل أو تم معالجته بالفعل.");
  }

  // --- 🛡️ PHYSICAL PROOF VERIFICATION ---
  // The agent MUST scan the QR code from the client's screen
  if (!request.qrCode || request.qrCode !== qrCode) {
    logger.warn("delivery.agent.complete.invalid_qr", { requestId, deliveryAgentId });
    throw new Error("كود التحقق (QR) غير صحيح. يرجى مسح الكود من شاشة العميل لتأكيد الاستلام.");
  }

  // --- 💸 CENTRALIZED SETTLEMENT ---
  // Instead of re-calculating money here (and risking errors), we delegate to the master settlement service
  try {
      const settlement = await settleOrder(requestId);
      
      logger.info("delivery.agent.complete.success", {
        requestId,
        deliveryAgentId,
        adminCommission: settlement.adminCommission
      });

      return settlement;
  } catch (error: any) {
      logger.error("delivery.agent.complete.settlement_failed", { requestId, error: error.message });
      throw new Error(`تعذر إتمام التسوية المالية: ${error.message}`);
  }
}

