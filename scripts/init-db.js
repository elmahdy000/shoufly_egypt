import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

console.log('Starting database migration...');

try {
  // Run Prisma migrate deploy to apply migrations
  console.log('Running Prisma migrations...');
  execSync('npx prisma migrate deploy', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  console.log('Database migration completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Error during database migration:', error.message);
  process.exit(1);
}
