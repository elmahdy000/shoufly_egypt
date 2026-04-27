import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up database for E2E...');
  
  // Delete in order of dependencies
  await prisma.transaction.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.request.deleteMany();
  
  console.log('✅ Database cleaned!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
