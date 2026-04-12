import { NextRequest } from 'next/server';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { listUserNotifications } from '@/lib/services/notifications';
import { fail, ok } from '@/lib/utils/http-response';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const notifications = await listUserNotifications(user.id, limit, offset);
    return ok(notifications);

  } catch (error) {
    return fail(error);
  }
}
