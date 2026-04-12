import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireRole, requireUser } from "@/lib/auth";
import { confirmDelivery } from "@/lib/services/qr";
import {
  ConfirmDeliveryBodySchema,
  ConfirmDeliveryRouteParamSchema,
} from "@/lib/validations/qr";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, "CLIENT");

    const routeParams = ConfirmDeliveryRouteParamSchema.parse(await params);
    const body = ConfirmDeliveryBodySchema.parse(
      await req.json().catch(() => ({})),
    );

    const result = await confirmDelivery({
      requestId: routeParams.requestId,
      clientId: user.id,
      qrCode: body.qrCode,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message === "Forbidden"
        ? 403
        : message.includes("Unauthorized")
          ? 401
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
