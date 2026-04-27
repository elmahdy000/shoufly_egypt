import { prisma } from './lib/prisma.js';

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'VENDOR' },
    select: { email: true, fullName: true, role: true, isActive: true }
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
