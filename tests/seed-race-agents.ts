import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hashed = await bcrypt.hash('Test1234!', 10);
  const agents = [];
  for (let i = 1; i <= 47; i++) {
    agents.push({
      fullName: `Race Agent ${i}`,
      email: `race.agent${i}@test.com`,
      password: hashed,
      role: 'DELIVERY' as const,
      isActive: true,
    });
  }
  await prisma.user.createMany({ data: agents, skipDuplicates: true });
  const count = await prisma.user.count({ where: { role: 'DELIVERY' } });
  console.log('✅ Total DELIVERY agents now:', count);
  await prisma.$disconnect();
}

main();
