import { Notify } from '../lib/services/notifications/hub';
import { prisma } from '../lib/prisma';

async function main() {
  const userId = 13; // Client 1
  
  console.log(`🚀 Sending test notification to User ID: ${userId}...`);
  
  try {
    const notification = await Notify.send({
      userId: userId,
      type: 'NEW_BID',
      title: 'عرض سعر جديد! 💸',
      message: 'هذا إشعار تجريبي يظهر كأنه عرض سعر جديد للتأكد من النظام.',
      metadata: { test: true }
    });
    
    console.log('✅ Notification sent successfully!');
    console.log(JSON.stringify(notification, null, 2));
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
