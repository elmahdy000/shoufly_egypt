import { NextRequest } from "next/server";
import { getCurrentUser, requireUser, requireRole } from "@/lib/auth";
import { acceptDeliveryTask } from "@/lib/services/delivery";
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

    // Rate Limit: Max 3 accepts per minute to prevent task grabbing bots
    const { checkRateLimit } = await import("@/lib/utils/rate-limiter");
    const rateLimit = await checkRateLimit(`delivery-accept:${user.id}`, 3, 60000);
    if (!rateLimit.allowed) {
      return fail(new Error("لقد قمت بمحاولة قبول العديد من المهام في وقت قصير. يرجى الانتظار دقيقة."));
    }

    const result = await acceptDeliveryTask(Number(requestId), user.id);
    return ok(result, 201);
  } catch (error) {
    return fail(error);
  }
}
