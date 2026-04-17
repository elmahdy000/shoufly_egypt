import { getCategories } from '../lib/services/categories/get-categories';
import { prisma } from '../lib/prisma';

async function runPerformanceCacheAudit() {
  console.log('⚡ --- STARTING PERFORMANCE CACHE AUDIT --- ⚡');
  console.log('Objective: Compare DB response vs. Redis RAM response.\n');

  try {
    // 1. First Call: Cache should be empty (or we invalidate it first)
    console.log('🐌 Calling [getCategories] - Round 1: DB Cold Start...');
    const startTime1 = Date.now();
    await getCategories({ parentId: null });
    const duration1 = Date.now() - startTime1;
    console.log(`⏱️ Round 1 Time: ${duration1}ms (Fetched from Postgres)\n`);

    // 2. Second Call: Cache should be PRIMED
    console.log('🚀 Calling [getCategories] - Round 2: Redis RAM Hot Hit...');
    const startTime2 = Date.now();
    await getCategories({ parentId: null });
    const duration2 = Date.now() - startTime2;
    console.log(`⏱️ Round 2 Time: ${duration2}ms (Fetched from Redis RAM)`);

    // 3. ANALYSIS
    const speedBoost = (duration1 / duration2).toFixed(1);
    console.log(`\n📈 Result: Round 2 was ${speedBoost}x FASTER than Round 1!`);
    
    if (duration2 < 5) {
        console.log('✅ PERFORMANCE GOAL REACHED: Sub-5ms response achieved.');
    }

  } catch (err: any) {
    console.error('❌ CACHE AUDIT ERROR:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runPerformanceCacheAudit();
