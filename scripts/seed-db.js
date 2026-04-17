import pkg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pkg;

async function seedDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Hash passwords
    const password123 = await bcrypt.hash('password123', 10);

    console.log('Seeding User table with test data...');

    // Clear existing users to avoid duplicates
    await client.query('DELETE FROM "User"');

    // Insert test users
    const users = [
      {
        email: 'admin@shoofly.com',
        fullName: 'مدير النظام',
        password: password123,
        role: 'ADMIN',
        isActive: true,
        phone: '+966501234567',
      },
      {
        email: 'client1@shoofly.com',
        fullName: 'أحمد العميل',
        password: password123,
        role: 'CLIENT',
        isActive: true,
        phone: '+966502345678',
      },
      {
        email: 'vendor1@shoofly.com',
        fullName: 'محمود التاجر',
        password: password123,
        role: 'VENDOR',
        isActive: true,
        phone: '+966503456789',
      },
      {
        email: 'rider1@shoofly.com',
        fullName: 'علي المندوب',
        password: password123,
        role: 'DELIVERY',
        isActive: true,
        phone: '+966504567890',
      },
    ];

    for (const user of users) {
      await client.query(
        `INSERT INTO "User" (email, "fullName", password, role, "isActive", phone, "isVerified", "isBlocked", "walletBalance", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, true, false, 0, NOW(), NOW())`,
        [
          user.email,
          user.fullName,
          user.password,
          user.role,
          user.isActive,
          user.phone,
        ]
      );
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase();
