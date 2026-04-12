import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { forwardOffer } from '@/lib/services/admin';
import { BidRouteParamSchema } from '@/lib/validations/admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bidId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'ADMIN');

    const { bidId } = BidRouteParamSchema.parse(await params);
    const bid = await forwardOffer(bidId);
    return NextResponse.json(bid);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: message.includes('Unauthorized') ? 401 : 400 }
    );
  }
}


