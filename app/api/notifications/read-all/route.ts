import { NextRequest } from 'next/server';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { markAllNotificationsRead } from '@/lib/services/notifications/mark-all-notifications-read';
import { fail, ok } from '@/lib/utils/http-response';

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    const result = await markAllNotificationsRead(user.id);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
