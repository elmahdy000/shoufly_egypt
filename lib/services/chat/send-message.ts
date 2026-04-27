import { prisma } from '@/lib/prisma';
import { logger } from '../../utils/logger';
import { notificationEmitter } from '@/lib/utils/event-emitter';

export async function sendMessage(params: {
  senderId: number;
  receiverId: number;
  content: string;
  requestId: number; // Mandatory for Shoofly context
}) {
  const { senderId, receiverId, content, requestId } = params;

  // 🛡️ SECURITY: Verify request status and participants
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        bids: {
          where: { OR: [{ status: 'SELECTED' }, { status: 'ACCEPTED_BY_CLIENT' }] },
          select: { vendorId: true }
        }
      }
    });

    if (!request) throw new Error('الطلب غير موجود.');

    // Check if request is closed or cancelled
    if (['CLOSED_SUCCESS', 'CLOSED_CANCELLED', 'REJECTED'].includes(request.status)) {
      throw new Error('لا يمكن إرسال رسائل على طلب مغلق أو ملغي.');
    }

    // Check if users are participants (Client or Vendor related to this request)
    const isClient = request.clientId === senderId || request.clientId === receiverId;
    const involvedVendors = request.bids.map(b => b.vendorId);
    const isVendor = involvedVendors.includes(senderId) || involvedVendors.includes(receiverId);

    // Admins can participate in any request chat for support (as sender OR receiver)
    const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { role: true } });
    const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { role: true } });
    const isAdmin = sender?.role === 'ADMIN' || receiver?.role === 'ADMIN';

    if (!isClient && !isVendor && !isAdmin) {
      throw new Error('غير مصرح لك بالمشاركة في هذه المحادثة.');
    }

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

  // Push real-time event via Redis (Multi-instance support)
  try {
    const { getRedisClient } = await import('@/lib/redis');
    const redis = getRedisClient();
    await redis.publish(`chat:${receiverId}`, JSON.stringify(message));
    logger.info('chat.message.broadcasted', { receiverId, messageId: message.id });
  } catch (err) {
    logger.error('chat.message.redis_failed', { error: err instanceof Error ? err.message : String(err) });
    // Fallback to local emitter just in case we are on a single instance without Redis
    notificationEmitter.emit(`chat:${receiverId}`, message);
  }

  return message;
}
