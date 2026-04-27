import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { getRequestDetails } from '@/lib/services/requests';
import { RequestIdParamSchema } from '@/lib/validations/request';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const parsedParams = RequestIdParamSchema.parse(await params);
    const id = parsedParams.id;
    const request = await getRequestDetails({
      requestId: id,
      userId: user.id,
      userRole: user.role,
    });
 
    return NextResponse.json(request);
  } catch (error: unknown) {
    console.error('*** REQUEST_GET_DEBUG ***', error);
    logError('REQUEST_GET', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const parsedParams = RequestIdParamSchema.parse(await params);
    const requestId = parsedParams.id;

    const { cancelRequest } = await import('@/lib/services/requests');
    const result = await cancelRequest({
      requestId,
      userId: user.id,
      role: user.role,
    });

    return NextResponse.json({ success: true, request: result });
  } catch (error: unknown) {
    logError('REQUEST_CANCEL', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}
