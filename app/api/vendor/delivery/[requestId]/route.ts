import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { updateDeliveryStatus } from '@/lib/services/delivery';
import {
  DeliveryRouteParamSchema,
  UpdateDeliveryStatusBodySchema,
} from '@/lib/validations/delivery';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const routeParams = DeliveryRouteParamSchema.parse(await params);
    const body = UpdateDeliveryStatusBodySchema.parse(await req.json());

    const updated = await updateDeliveryStatus({
      requestId: routeParams.requestId,
      vendorId: user.id,
      status: body.status,
      note: body.note,
      locationText: body.locationText,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status =
      message === 'Forbidden'
        ? 403
        : message.includes('Unauthorized')
          ? 401
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}


