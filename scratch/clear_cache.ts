import { cache } from '../lib/cache';

async function main() {
  console.log('🧹 Clearing categories cache by pattern...');
  const deletedCount = await cache.deletePattern('categories_tree:*');
  console.log(`✅ Categories cache cleared. Deleted ${deletedCount} keys.`);
  process.exit(0);
}

main().catch(console.error);
