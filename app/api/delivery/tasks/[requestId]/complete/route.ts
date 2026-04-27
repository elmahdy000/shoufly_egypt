import { NextRequest } from "next/server";
import { getCurrentUser, requireUser, requireRole } from "@/lib/auth";
import { completeDeliveryAgent } from "@/lib/services/delivery";
import { fail, ok } from "@/lib/utils/http-response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, "DELIVERY");
    const { requestId } = await params;
    const { qrCode } = await req.json();
    
    if (!qrCode) throw new Error("كود التحقق مطلوب لإتمام العملية");

    const result = await completeDeliveryAgent(Number(requestId), user.id, qrCode);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
