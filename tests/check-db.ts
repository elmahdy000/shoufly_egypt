import { prisma } from '../lib/prisma';

async function checkAndSeed() {
  const categories = await prisma.category.findMany();
  console.log(`Found ${categories.length} categories.`);
  
  if (categories.length === 0) {
    console.log('Seeding initial categories...');
    await prisma.category.create({
      data: {
        name: 'Maintenance',
        slug: 'maintenance',
        subcategories: {
          create: {
            name: 'Plumbing',
            slug: 'plumbing'
          }
        }
      }
    });
    console.log('Seed completed.');
  }

  const client = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: { email: 'client@test.com', fullName: 'Test Client', role: 'CLIENT', password: 'password', isActive: true }
  });

  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@test.com' },
    update: {},
    create: { email: 'vendor@test.com', fullName: 'Test Vendor', role: 'VENDOR', password: 'password', isActive: true }
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { role: 'ADMIN' },
    create: { email: 'admin@test.com', fullName: 'Admin User', role: 'ADMIN', password: 'password', isActive: true }
  });

  const rider = await prisma.user.upsert({
    where: { email: 'rider@test.com' },
    update: { role: 'DELIVERY' },
    create: { email: 'rider@test.com', fullName: 'Test Rider', role: 'DELIVERY', password: 'password', isActive: true }
  });

  await prisma.platformSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      commissionPercent: 15,
      minVendorMatchCount: 3,
      initialRadiusKm: 5,
      maxRadiusKm: 50,
      radiusExpansionStepKm: 5
    }
  });

  console.log('✅ Mock users and settings ready:', { client: client.id, vendor: vendor.id, admin: admin.id, rider: rider.id });
}

checkAndSeed().catch(console.error);
