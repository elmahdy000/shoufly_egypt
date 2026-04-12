import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { payRequest } from '@/lib/services/payments';
import { PayRequestBodySchema, PayRequestRouteParamSchema } from '@/lib/validations/payment';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'CLIENT');

    const routeParams = PayRequestRouteParamSchema.parse(await params);
    const body = PayRequestBodySchema.parse(await req.json().catch(() => ({})));

    if (body.requestId && body.requestId !== routeParams.requestId) {
      return NextResponse.json(
        { error: 'requestId in body does not match route parameter' },
        { status: 400 }
      );
    }

    const result = await payRequest(routeParams.requestId, user.id);
    return NextResponse.json(result);
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


