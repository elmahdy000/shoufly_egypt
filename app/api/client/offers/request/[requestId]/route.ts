import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { listForwardedOffers } from '@/lib/services/offers';
import { OfferRequestRouteParamSchema } from '@/lib/validations/offer';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'CLIENT');

    const { requestId } = OfferRequestRouteParamSchema.parse(await params);
    const offers = await listForwardedOffers(requestId, user.id);
    return NextResponse.json(offers);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message === 'Forbidden' ? 403 : message.includes('Unauthorized') ? 401 : 400;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}


