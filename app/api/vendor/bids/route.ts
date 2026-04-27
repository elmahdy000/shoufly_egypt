import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { listVendorBids } from '@/lib/services/bids';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const bids = await listVendorBids(user.id);
    return NextResponse.json(bids);
  } catch (error: unknown) {
    logError('VENDOR_BIDS_GET', error);
    const { response, status } = createErrorResponse(error);
    return NextResponse.json(response, { status });
  }
}


