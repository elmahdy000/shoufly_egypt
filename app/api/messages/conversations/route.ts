import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    // Get all unique users this user has messaged with
    const conversations = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      orderBy: { createdAt: 'desc' },
      select: {
          senderId: true,
          receiverId: true,
          content: true,
          createdAt: true,
          sender: { select: { id: true, fullName: true, role: true } },
          receiver: { select: { id: true, fullName: true, role: true } }
      }
    });

    // Group and Deduplicate for UI
    const partners = new Map();
    conversations.forEach(msg => {
        const partner = msg.senderId === user.id ? msg.receiver : msg.sender;
        if (!partners.has(partner.id)) {
            partners.set(partner.id, {
                id: partner.id,
                name: partner.fullName,
                role: partner.role,
                lastMsg: msg.content,
                time: msg.createdAt
            });
        }
    });

    return NextResponse.json(Array.from(partners.values()));
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
