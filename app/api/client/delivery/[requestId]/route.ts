import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { listDeliveryTimeline } from '@/lib/services/delivery';
import { DeliveryRouteParamSchema } from '@/lib/validations/delivery';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'CLIENT');

    const routeParams = DeliveryRouteParamSchema.parse(await params);
    const timeline = await listDeliveryTimeline(routeParams.requestId, user.id);
    return NextResponse.json(timeline);
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


