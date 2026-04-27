import { prisma } from '../lib/prisma';

async function main() {
  console.log('🧹 Cleaning up database for E2E...');
  
  await prisma.transaction.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.request.deleteMany();
  
  console.log('✅ Database cleaned!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
