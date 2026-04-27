import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding E2E Users...');
  const password = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'client@shoofly.com', fullName: 'Client Test', role: 'CLIENT' },
    { email: 'admin@shoofly.com', fullName: 'Admin Test', role: 'ADMIN' },
    { email: 'vendor1@shoofly.com', fullName: 'Vendor 1', role: 'VENDOR' },
    { email: 'vendor2@shoofly.com', fullName: 'Vendor 2', role: 'VENDOR' },
    { email: 'vendor3@shoofly.com', fullName: 'Vendor 3', role: 'VENDOR' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password, role: u.role as any },
      create: { 
        email: u.email, 
        password, 
        fullName: u.fullName, 
        role: u.role as any,
        phoneNumber: Math.floor(Math.random() * 1000000000).toString()
      },
    });
    console.log(`✅ User ${u.email} ready`);
  }

  // Ensure client has money
  const client = await prisma.user.findUnique({ where: { email: 'client@shoofly.com' } });
  if (client) {
    await prisma.wallet.upsert({
      where: { userId: client.id },
      update: { balance: 5000 },
      create: { userId: client.id, balance: 5000 },
    });
    console.log('💰 Client wallet topped up to 5000 EGP');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
