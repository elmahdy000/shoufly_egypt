import pkg from 'pg';

const { Client } = pkg;

async function seedCategoriesAndDefaults() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Seeding categories and governorates...');

    // Insert governorates
    const governorates = [
      'الرياض',
      'جدة',
      'الدمام',
      'مكة',
      'المدينة',
      'الأحساء',
      'تبوك',
      'الباحة',
      'جازان',
      'نجران',
      'عسير',
      'حائل',
      'القصيم',
      'الجوف',
      'الحدود الشمالية',
    ];

    for (const gov of governorates) {
      await client.query(
        `INSERT INTO "Governorate" (name) VALUES ($1) ON CONFLICT DO NOTHING`,
        [gov]
      );
    }
    console.log(`Inserted ${governorates.length} governorates`);

    // Insert some cities for Riyadh
    const cities = [
      { name: 'الرياض', governorate: 'الرياض' },
      { name: 'الرمال', governorate: 'الرياض' },
      { name: 'العليا', governorate: 'الرياض' },
    ];

    for (const city of cities) {
      await client.query(
        `INSERT INTO "City" (name, "governorateId")
         SELECT $1, id FROM "Governorate" WHERE name = $2
         ON CONFLICT DO NOTHING`,
        [city.name, city.governorate]
      );
    }
    console.log(`Inserted ${cities.length} cities`);

    // Insert categories
    const categories = [
      { name: 'السباكة', slug: 'plumbing', type: 'SERVICE', requiresBrand: false },
      { name: 'الكهرباء', slug: 'electrical', type: 'SERVICE', requiresBrand: false },
      { name: 'التنظيف', slug: 'cleaning', type: 'SERVICE', requiresBrand: false },
      { name: 'الأثاث', slug: 'furniture', type: 'PRODUCT', requiresBrand: false },
      { name: 'قطع الغيار', slug: 'spare-parts', type: 'PRODUCT', requiresBrand: true, brandType: 'Car' },
      { name: 'الدروس الخصوصية', slug: 'tutoring', type: 'DIGITAL', requiresBrand: false },
      { name: 'إصلاح الهواتف', slug: 'phone-repair', type: 'SERVICE', requiresBrand: true, brandType: 'Phone' },
      { name: 'صيانة المكيفات', slug: 'ac-maintenance', type: 'SERVICE', requiresBrand: false },
    ];

    for (const category of categories) {
      await client.query(
        `INSERT INTO "Category" (name, slug, type, "requiresBrand", "brandType", "createdAt")
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [category.name, category.slug, category.type, category.requiresBrand, category.brandType]
      );
    }
    console.log(`Inserted ${categories.length} categories`);

    // Insert platform settings if not exists
    await client.query(
      `INSERT INTO "PlatformSetting" ("commissionPercent", "minVendorMatchCount", "initialRadiusKm", "maxRadiusKm", "radiusExpansionStepKm", "updatedAt")
       VALUES (15, 3, 5, 50, 5, NOW())
       ON CONFLICT DO NOTHING`
    );
    console.log('Platform settings initialized');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedCategoriesAndDefaults();
