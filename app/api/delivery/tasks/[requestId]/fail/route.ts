import { NextRequest } from "next/server";
import { getCurrentUser, requireUser, requireRole } from "@/lib/auth";
import { failDeliveryAgent } from "@/lib/services/delivery";
import { fail, ok } from "@/lib/utils/http-response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, "DELIVERY");
    const { requestId } = await params;
    const body = await req.json().catch(() => ({}));
    const result = await failDeliveryAgent({
      requestId: Number(requestId),
      deliveryAgentId: user.id,
      reason: typeof body.reason === "string" ? body.reason : undefined,
    });
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
