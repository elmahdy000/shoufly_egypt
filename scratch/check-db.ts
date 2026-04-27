
import { prisma } from '../lib/prisma';

async function main() {
  const usersCount = await prisma.user.count();
  const requestsCount = await prisma.request.count();
  const vendorsCount = await prisma.user.count({ where: { role: 'VENDOR' } });
  
  console.log('--- DB SUMMARY ---');
  console.log('Total Users:', usersCount);
  console.log('Total Vendors:', vendorsCount);
  console.log('Total Requests:', requestsCount);
  
  if (usersCount > 0) {
    const sampleUsers = await prisma.user.findMany({ take: 5 });
    console.log('\nSample Users:', JSON.stringify(sampleUsers.map(u => ({ id: u.id, name: u.fullName, email: u.email, role: u.role })), null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
