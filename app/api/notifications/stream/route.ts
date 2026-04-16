import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { notificationEmitter } from '@/lib/utils/event-emitter';

/**
 * Real-time Notification & Chat Stream (SSE)
 * Optimized to prevent memory leaks and handle connection lifecycle
 */

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const userId = user.id;
  const encoder = new TextEncoder();
  let heartbeatInterval: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          // Stream might be closed
        }
      };

      // Define specialized listeners for this user
      const onNotification = (notification: any) => send({ type: 'notification', data: notification });
      const onChatMessage = (message: any) => send({ type: 'chat', data: message });

      // Subscribe to events
      notificationEmitter.on(`user:${userId}`, onNotification);
      notificationEmitter.on(`chat:${userId}`, onChatMessage);

      // Heartbeat to keep connection alive (every 30s)
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch (e) {
          cleanup();
        }
      }, 30000);

      // Centralized cleanup function
      const cleanup = () => {
        clearInterval(heartbeatInterval);
        notificationEmitter.off(`user:${userId}`, onNotification);
        notificationEmitter.off(`chat:${userId}`, onChatMessage);
        try {
          controller.close();
        } catch (e) {}
      };

      // Handle explicit client disconnect
      req.signal.addEventListener('abort', cleanup);
    },
    cancel() {
      // Called when the stream is cancelled by the consumer
      // This is crucial in Next.js/Edge for preventing leaks
      notificationEmitter.removeAllListeners(`user:${userId}`);
      notificationEmitter.removeAllListeners(`chat:${userId}`);
      clearInterval(heartbeatInterval);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for Nginx
    },
  });
}
