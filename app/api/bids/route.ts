import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { CreateBidSchema } from '@/lib/validations/bid';
import { createBid, listVendorBids } from '@/lib/services/bids';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const body = await req.json();
    const validated = CreateBidSchema.parse(body);

    const bid = await createBid(user.id, validated);
    return NextResponse.json(bid, { status: 201 });
  } catch (error: unknown) {
    logError('BIDS_POST', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const bids = await listVendorBids(user.id);
    return NextResponse.json(bids);
  } catch (error: unknown) {
    logError('BIDS_GET', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}


