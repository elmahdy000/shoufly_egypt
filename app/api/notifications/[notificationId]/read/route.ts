import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { markNotificationRead } from '@/lib/services/notifications';
import { fail, ok } from '@/lib/utils/http-response';

const NotificationRouteParamSchema = z.object({
  notificationId: z.coerce.number().int().positive(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const routeParams = NotificationRouteParamSchema.parse(await params);
    const result = await markNotificationRead(routeParams.notificationId, user.id);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
