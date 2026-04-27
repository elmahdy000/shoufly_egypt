
import { prisma } from '../lib/prisma';
import redis from '../lib/redis';

async function check() {
  console.log('Checking DB...');
  try {
    const count = await prisma.category.count();
    console.log('DB OK, categories count:', count);
  } catch (err) {
    console.error('DB Error:', err);
  }

  console.log('Checking Redis...');
  try {
    const status = await redis.status;
    console.log('Redis status:', status);
    // Use the proxy methods
    await redis.set('test_key', 'test_value');
    const val = await redis.get('test_key');
    console.log('Redis OK, test_key:', val);
  } catch (err) {
    console.error('Redis Error:', err);
  }

  process.exit(0);
}

check();
