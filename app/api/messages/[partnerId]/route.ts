import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMessage } from '@/lib/services/chat/send-message';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const { partnerId } = await params;
    const pid = parseInt(partnerId);

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: pid },
          { senderId: pid, receiverId: user.id }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
          sender: { select: { id: true, fullName: true } }
      }
    });

    return NextResponse.json(messages);
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
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
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
