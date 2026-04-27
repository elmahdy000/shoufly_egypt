
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.request.findMany({
    select: { id: true, title: true, clientId: true },
    orderBy: { id: 'asc' }
  });
  console.log('Requests in DB:', JSON.stringify(requests, null, 2));

  const users = await prisma.user.findMany({
    select: { id: true, fullName: true, role: true }
  });
  console.log('Users in DB:', JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
