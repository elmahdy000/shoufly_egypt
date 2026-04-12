import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { sendMessage } from '@/lib/services/chat/send-message';
import { listMessages } from '@/lib/services/chat/list-messages';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const { searchParams } = new URL(req.url);
    const otherId = parseInt(searchParams.get('otherId') || '0');
    if (!otherId) throw new Error('Other user ID is required');

    const messages = await listMessages(user.id, otherId);
    return NextResponse.json(messages);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const body = await req.json();
    const { receiverId, content, requestId } = body;

    const msg = await sendMessage({
      senderId: user.id,
      receiverId,
      content,
      requestId,
    });

    return NextResponse.json(msg);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const body = await req.json();
    const { senderId } = body; // Mark all messages from this sender as read

    await prisma.chatMessage.updateMany({
      where: { senderId, receiverId: user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

