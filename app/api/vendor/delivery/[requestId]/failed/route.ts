import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { markFailedDelivery } from '@/lib/services/delivery';
import { DeliveryRouteParamSchema, MarkFailedDeliveryBodySchema } from '@/lib/validations/delivery';
import { fail, ok } from '@/lib/utils/http-response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const routeParams = DeliveryRouteParamSchema.parse(await params);
    const body = MarkFailedDeliveryBodySchema.parse(await req.json().catch(() => ({})));

    const result = await markFailedDelivery({
      requestId: routeParams.requestId,
      vendorId: user.id,
      note: body.note,
      locationText: body.locationText,
    });

    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
