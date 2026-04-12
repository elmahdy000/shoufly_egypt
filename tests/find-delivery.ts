import { prisma } from '../lib/prisma';

async function findDelivery() {
  const agents = await prisma.user.findMany({
    where: { role: 'DELIVERY' },
    select: { id: true, email: true, fullName: true, isActive: true },
    take: 5,
  });

  console.log('🚚 Delivery Agents Found:');
  agents.forEach(a => {
    const statusIcon = a.isActive ? '✅' : '❌';
    console.log(`   ${statusIcon} #${a.id}: ${a.fullName} (${a.email})`);
  });

  if (agents.length === 0) {
    console.log('   ❌ No delivery agents found!');
    console.log('   Creating test delivery agent...');

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const newAgent = await prisma.user.create({
      data: {
        fullName: 'أحمد محمود',
        email: 'delivery1@shoofly.com',
        password: hashedPassword,
        role: 'DELIVERY',
        isActive: true,
        phone: '01012345678',
      },
    });

    console.log(`   ✅ Created: #${newAgent.id} - ${newAgent.email}`);
  }

  await prisma.$disconnect();
}

findDelivery();
