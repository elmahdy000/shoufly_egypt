import { createSubscriberClient } from './redis';
import { notificationEmitter } from './utils/event-emitter';
import { logger } from './utils/logger';

/**
 * 📡 Redis Global Subscriber
 * Bridges Redis Pub/Sub events to the local EventEmitter (SSE).
 */

let subscriber: any = null;
let isInitialized = false;

export function initRedisSubscriber() {
  if (isInitialized) return;
  
  subscriber = createSubscriberClient();
  
  if (subscriber.status === 'ready' || typeof subscriber.subscribe === 'function') {
    logger.info('📡 [Redis Subscriber] Initializing...');
    
    // Subscribe to wildcard user notifications and chat messages
    // Note: psubscribe is better for patterns, but here we use individual channels
    // based on how Notify publishes them.
    
    subscriber.on('message', (channel: string, message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (channel.startsWith('user_notifications:')) {
          const userId = parseInt(channel.split(':')[1]);
          logger.info(`📩 [Redis Subscriber] Received Notification for User ${userId}`);
          notificationEmitter.sendNotification(userId, data);
        }
        
        if (channel.startsWith('chat:')) {
          const userId = parseInt(channel.split(':')[1]);
          logger.info(`💬 [Redis Subscriber] Received Chat Message for User ${userId}`);
          notificationEmitter.sendChatMessage(userId, data);
        }
      } catch (err) {
        logger.error('redis.subscriber.parse_error', { error: err instanceof Error ? err.message : String(err) });
      }
    });

    // We use psubscribe for patterns to avoid multiple subscribe calls
    if (typeof subscriber.psubscribe === 'function') {
        subscriber.psubscribe('user_notifications:*', 'chat:*');
        subscriber.on('pmessage', (pattern: string, channel: string, message: string) => {
            // Trigger the same logic as 'message'
            subscriber.emit('message', channel, message);
        });
        logger.info('redis.subscriber.patterns_subscribed');
    }

    isInitialized = true;
  }
}

/**
 * Cleanup on app shutdown
 */
export async function closeRedisSubscriber() {
    if (subscriber && typeof subscriber.quit === 'function') {
        await subscriber.quit();
        isInitialized = false;
    }
}
