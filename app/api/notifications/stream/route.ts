import { NextRequest } from 'next/server';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { notificationEmitter } from '@/lib/utils/event-emitter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Notification Listener
      const onNotification = (notification: any) => {
        send({ type: 'notification', data: notification });
      };

      // Chat Listener
      const onChatMessage = (message: any) => {
        send({ type: 'chat', data: message });
      };

      notificationEmitter.on(`user:${user.id}`, onNotification);
      notificationEmitter.on(`chat:${user.id}`, onChatMessage);

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000);

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        notificationEmitter.off(`user:${user.id}`, onNotification);
        notificationEmitter.off(`chat:${user.id}`, onChatMessage);
        controller.close();
      });

    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
