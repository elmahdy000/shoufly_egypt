import { prisma } from '../lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    take: 5,
    select: { id: true, fullName: true, email: true }
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
