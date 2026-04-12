import { prisma } from '../lib/prisma';
import { createNotification } from '../lib/services/notifications';
import { notificationEmitter } from '../lib/utils/event-emitter';
import 'dotenv/config';

async function testNotifications() {
  console.log('🔔 STARTING NOTIFICATION SYSTEM TEST...\n');

  try {
    // 1. Setup a dummy user with a device token
    const user = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    if (!user) throw new Error('No client found. Run simulation.ts first.');

    console.log(`Setting FCM Token for User #${user.id} (${user.fullName})...`);
    await prisma.user.update({
      where: { id: user.id },
      data: { fcmToken: 'mock-fcm-token-12345' }
    });

    // 2. Listen for Real-time event (SSE simulation)
    notificationEmitter.on(`user:${user.id}`, (notification) => {
      console.log('✅ SSE EVENT RECEIVED:', notification.title);
    });

    // 3. Trigger a notification
    console.log('\n--- Triggering Notification ---');
    await createNotification({
      userId: user.id,
      type: 'PAYMENT_RECEIVED',
      title: 'Congratulations!',
      message: 'You have successfully integrated Real-time & Push notifications.'
    });

    console.log('\n✨ TEST COMPLETE. Check terminal logs for [FCM MOCK] output.');

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testNotifications();
