import { prisma } from '@/lib/prisma';

export async function listMessages(userId: number, otherId: number, limit = 50, offset = 0) {
  return prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, fullName: true, role: true } },
    },
    take: limit,
    skip: offset,
  });
}
