import { prisma } from '../lib/prisma';
import 'dotenv/config';

async function runChatFlowTest() {
  console.log('💬 Starting Real-time Chat & Messaging Audit...\n');

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });

    if (!client || !vendor) throw new Error('Need at least one client and one vendor for chat test');

    // 1. Send Message
    console.log(`✉️ Sending message from Client #${client.id} to Vendor #${vendor.id}...`);
    const msg = await prisma.chatMessage.create({
        data: {
            senderId: client.id,
            receiverId: vendor.id,
            content: 'يا ريت نأكد الميعاد بكرة الساعة ١٠',
            isRead: false
        }
    });
    console.log(`   Sent: "${msg.content}"`);

    // 2. Read Check
    console.log('👀 Verifying "isRead" status logic...');
    if (msg.isRead) throw new Error('Message should be unread initially');
    
    await prisma.chatMessage.update({
        where: { id: msg.id },
        data: { isRead: true }
    });
    console.log('   Result: Message marked as read successfully.');

    // 3. Thread Retrieval Simulation
    console.log('🧵 Simulating conversation thread retrieval...');
    const thread = await prisma.chatMessage.findMany({
        where: {
            OR: [
                { senderId: client.id, receiverId: vendor.id },
                { senderId: vendor.id, receiverId: client.id }
            ]
        },
        orderBy: { createdAt: 'asc' }
    });
    console.log(`   Thread Size: ${thread.length} messages found between users.`);

    // 4. Cleanup
    await prisma.chatMessage.delete({ where: { id: msg.id } });
    console.log('\n✨ Chat flow audit complete.');

  } catch (err) {
    console.error('💥 Chat Audit Failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runChatFlowTest();
