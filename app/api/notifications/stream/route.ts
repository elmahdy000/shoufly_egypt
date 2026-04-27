import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { notificationEmitter } from '@/lib/utils/event-emitter';
import { initRedisSubscriber } from '@/lib/redis-subscriber';

/**
 * Real-time Notification & Chat Stream (SSE)
 * Optimized to prevent memory leaks and handle connection lifecycle
 */

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Ensure Redis Subscriber is running to bridge messages to notificationEmitter
  initRedisSubscriber();

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

      // Store cleanup function so cancel() can access it
      (controller as any)._cleanup = cleanup;
    },
    cancel(controller) {
      // Called when the stream is cancelled by the consumer
      // Execute the specific cleanup to avoid removing other tabs' listeners
      const cleanup = (controller as any)._cleanup;
      if (cleanup) cleanup();
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
