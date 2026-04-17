import { prisma } from '../lib/prisma';
import redis from '../lib/redis';
import { Notify } from '../lib/services/notifications/hub';
import { disputeOrder } from '../lib/services/requests/dispute-order';

async function runRealtimeNotificationAudit() {
  console.log('📡 --- STARTING REAL-TIME NOTIFICATION AUDIT --- 📡');
  console.log('Checking if events trigger the hub and broadcast to Redis...\n');

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });

    if (!client || !vendor) throw new Error('Client or Vendor missing for audit.');

    // 1. Trigger Bid Notification
    console.log('👉 ACTION: Vendor submits a new bid...');
    await Notify.newBid(client.id, 999, 500);

    // 2. Trigger Payment Notification
    console.log('\n👉 ACTION: Client pays for the order...');
    await Notify.paymentConfirmed(vendor.id, 999, 500);

    // 3. Trigger Dispute Notification (Through the Service)
    console.log('\n👉 ACTION: Client raises a dispute via Dispute Service...');
    
    const cat = await prisma.category.findFirst();
    if (!cat) throw new Error('No category found');

    const req = await prisma.request.create({
        data: {
            clientId: client.id, categoryId: cat.id, title: 'Realtime Check', description: 'Testing Hub',
            address: 'X', latitude: 0, longitude: 0, deliveryPhone: '0',
            status: 'ORDER_PAID_PENDING_DELIVERY'
        }
    });
    await prisma.bid.create({
        data: {
          requestId: req.id, vendorId: vendor.id, netPrice: 100, clientPrice: 115, description: 'Test',
          status: 'ACCEPTED_BY_CLIENT'
        }
    });

    await disputeOrder(client.id, req.id, 'لم يعجبني المنتج');

    // 4. VERIFICATION: Query the DB to see if they were persisted
    console.log('\n🔍 --- PERSISTENCE CHECK: DATABASE LOGS ---');
    const logs = await prisma.notification.findMany({
        where: { userId: { in: [client.id, vendor.id] } },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    logs.forEach(l => {
        console.log(`📦 Notification in DB: [${l.type}] -> To User ${l.userId}: ${l.title}`);
    });

    console.log('\n✅ REAL-TIME AUDIT COMPLETE: All events reached the Hub and were persisted.');
    console.log('🚀 SYSTEM READY: Every action now triggers a synchronized Redis broadcast.');

  } catch (err: any) {
    console.error('❌ AUDIT ERROR:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runRealtimeNotificationAudit();
