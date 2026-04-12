import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { getRequestDetails } from '@/lib/services/requests';
import { RequestIdParamSchema } from '@/lib/validations/request';

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

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: message.includes('not found') ? 404 : 400 }
    );
  }
}export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const { id } = await params;
    const requestId = parseInt(id);

    const { cancelRequest } = await import('@/lib/services/requests');
    const result = await cancelRequest({
      requestId,
      userId: user.id,
      role: user.role,
    });

    return NextResponse.json({ success: true, request: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
