import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { acceptOffer } from '@/lib/services/offers';
import { OfferBidRouteParamSchema } from '@/lib/validations/offer';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bidId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'CLIENT');

    const { bidId } = OfferBidRouteParamSchema.parse(await params);
    const bid = await acceptOffer(bidId, user.id);
    return NextResponse.json(bid);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: message.includes('Unauthorized') ? 401 : 400 }
    );
  }
}


