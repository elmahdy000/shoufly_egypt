import fs from 'fs';
import path from 'path';
import pkg from 'pg';

const { Client } = pkg;

// Use absolute path
const sqlFilePath = '/vercel/share/v0-project/scripts/init-db.sql';

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Reading SQL migration file from:', sqlFilePath);
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log('Executing SQL migration...');
    await client.query(sql);

    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database migration:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
