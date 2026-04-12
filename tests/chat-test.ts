import { prisma } from '../lib/prisma';
import { sendMessage } from '../lib/services/chat/send-message';
import { listMessages } from '../lib/services/chat/list-messages';
import 'dotenv/config';

async function runChatTest() {
  console.log('💬 STARTING COMPREHENSIVE CHAT SYSTEM TEST...\n');

  try {
    // 1. Setup participants
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });

    if (!admin || !client || !vendor) {
      throw new Error('Required test users (Admin, Client, Vendor) not found.');
    }

    console.log(`Participants: Admin(#${admin.id}), Client(#${client.id}), Vendor(#${vendor.id})`);

    // 2. Admin <-> Client Chat
    console.log('\n--- Scenario 1: Admin & Client Communication ---');
    await sendMessage({
      senderId: admin.id,
      receiverId: client.id,
      content: 'Hello Client, how can I help you today?',
    });
    
    await sendMessage({
      senderId: client.id,
      receiverId: admin.id,
      content: 'I have an issue with the delivery address.',
    });

    const clientHistory = await listMessages(admin.id, client.id);
    console.log(`✅ Admin/Client history retrieved. Messages count: ${clientHistory.length}`);
    clientHistory.forEach(m => console.log(`   [${m.sender.role}] ${m.content}`));

    // 3. Admin <-> Vendor Chat (Contextual with RequestId)
    console.log('\n--- Scenario 2: Admin & Vendor (Contextual) ---');
    const request = await prisma.request.findFirst();
    const requestId = request?.id;

    await sendMessage({
      senderId: vendor.id,
      receiverId: admin.id,
      content: 'Can you please review my recent bid?',
      requestId: requestId,
    });

    await sendMessage({
      senderId: admin.id,
      receiverId: vendor.id,
      content: 'We are processing it now, please wait.',
      requestId: requestId,
    });

    const vendorHistory = await listMessages(admin.id, vendor.id);
    console.log(`✅ Admin/Vendor history retrieved. Messages count: ${vendorHistory.length}`);
    vendorHistory.forEach(m => {
        const context = m.requestId ? ` (Req #${m.requestId})` : '';
        console.log(`   [${m.sender.role}] ${m.content}${context}`);
    });

    // 4. Verification Check: Unread counts
    const unreadForAdmin = await prisma.chatMessage.count({
      where: { receiverId: admin.id, isRead: false }
    });
    console.log(`\n✅ Unread messages for Admin: ${unreadForAdmin}`);

    console.log('\n✨ CHAT SYSTEM TEST PASSED SUCCESSFULLY!');

  } catch (error) {
    console.error('\n❌ CHAT TEST FAILED:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

runChatTest();
