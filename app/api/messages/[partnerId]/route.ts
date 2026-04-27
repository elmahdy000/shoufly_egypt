import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { listMessages } from '@/lib/services/chat/list-messages';
import { sendMessage } from '@/lib/services/chat/send-message';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

/**
 * 💬 Partner-specific Messages API
 * Standardized with pagination and unified error handling.
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const { partnerId } = await params;
    const pid = parseInt(partnerId);

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('requestId') ? parseInt(searchParams.get('requestId')!) : undefined;
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
    const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

    // Reuse the central service for consistency
    const messages = await listMessages(user.id, pid, limit, offset, requestId);

    return NextResponse.json(messages);
  } catch (error: unknown) {
    logError('MESSAGES_PARTNER_GET', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const { partnerId } = await params;
    const { content, requestId } = await req.json();

    const result = await sendMessage({
        senderId: user.id,
        receiverId: parseInt(partnerId),
        content,
        requestId
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    logError('MESSAGES_PARTNER_POST', error);
    const { response, status } = createErrorResponse(error, 400);
    return NextResponse.json(response, { status });
  }
}
