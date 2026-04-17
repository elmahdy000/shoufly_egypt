import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listVendorOpenRequests } from '@/lib/services/requests';


export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const governorateId = searchParams.get('governorateId');
    const cityId = searchParams.get('cityId');

    const filters = {
      governorateId: governorateId ? parseInt(governorateId) : undefined,
      cityId: cityId ? parseInt(cityId) : undefined,
    };

    const requests = await listVendorOpenRequests(user.id, filters, limit, offset);

    return NextResponse.json(requests);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: message.includes('Unauthorized') ? 401 : 400 }
    );
  }
}


