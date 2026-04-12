import { prisma } from '@/lib/prisma';
import { notificationEmitter } from '@/lib/utils/event-emitter';

export async function sendMessage(params: {
  senderId: number;
  receiverId: number;
  content: string;
  requestId?: number;
}) {
  const { senderId, receiverId, content, requestId } = params;

  const message = await prisma.chatMessage.create({
    data: {
      senderId,
      receiverId,
      content,
      requestId,
    },
    include: {
      sender: { select: { id: true, fullName: true, role: true } },
    }
  });

  // Push real-time event to the receiver
  notificationEmitter.emit(`chat:${receiverId}`, message);

  return message;
}
