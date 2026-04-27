import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { listVendorOpenRequests } from '@/lib/services/requests';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const governorateId = searchParams.get('governorateId');
    const cityId = searchParams.get('cityId');

    const filters = {
      governorateId: governorateId ? parseInt(governorateId) : undefined,
      cityId: cityId ? parseInt(cityId) : undefined,
    };

    const requests = await listVendorOpenRequests(user.id, filters, limit, offset);
    return NextResponse.json(requests);
  } catch (error: unknown) {
    logError('VENDOR_OPEN_REQUESTS_GET', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}
