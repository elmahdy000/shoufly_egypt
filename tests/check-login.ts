/**
 * Check Login Credentials for All Roles
 */

import { prisma } from '../lib/prisma';

async function checkAllLogins() {
  console.log('🔐 Checking Login Credentials for All Roles...\n');

  const testUsers = [
    { email: 'client1@shoofly.com', role: 'CLIENT', password: 'password123' },
    { email: 'vendor1@shoofly.com', role: 'VENDOR', password: 'password123' },
    { email: 'rider1@shoofly.com', role: 'DELIVERY', password: 'password123' },
    { email: 'admin@shoofly.com', role: 'ADMIN', password: 'admin123' },
  ];

  let allActive = true;

  for (const user of testUsers) {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, email: true, role: true, isActive: true, fullName: true },
    });

    if (dbUser) {
      const statusIcon = dbUser.isActive ? '✅' : '❌';
      const roleIcon = dbUser.role === user.role ? '✅' : '❌';

      console.log(`${roleIcon} ${user.role}`);
      console.log(`   Name: ${dbUser.fullName}`);
      console.log(`   Email: ${dbUser.email}`);
      console.log(`   Status: ${statusIcon} ${dbUser.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   ID: #${dbUser.id}`);
      console.log(`   Password: ${user.password}`);
      console.log();

      if (!dbUser.isActive) allActive = false;
    } else {
      console.log(`❌ ${user.role}: User not found - ${user.email}\n`);
      allActive = false;
    }
  }

  console.log('='.repeat(50));
  if (allActive) {
    console.log('✅ All users are active and ready for login!');
  } else {
    console.log('⚠️ Some users are inactive or missing!');
  }
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

if (require.main === module) {
  checkAllLogins()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { checkAllLogins };
