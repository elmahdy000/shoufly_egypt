/**
 * Performance Test Suite
 * Tests system performance under various loads
 */

import { prisma } from '../lib/prisma';
import { monitor, logMemoryUsage } from '../lib/performance-monitor';
import { cache } from '../lib/cache';

async function runPerformanceTests() {
  console.log('\n🚀 Performance Test Suite\n');
  console.log('=' .repeat(60));

  const results: { test: string; duration: number; status: 'pass' | 'fail' }[] = [];

  // Test 1: Database Query Performance
  try {
    console.log('\n📊 Test 1: Database Query Performance');
    
    const start = performance.now();
    
    await monitor.track('db-user-count', () => prisma.user.count());
    await monitor.track('db-request-list', () => 
      prisma.request.findMany({ take: 10, orderBy: { createdAt: 'desc' } })
    );
    await monitor.track('db-bid-aggregate', () => 
      prisma.bid.aggregate({ _sum: { netPrice: true } })
    );
    
    const duration = performance.now() - start;
    results.push({ test: 'Database Queries', duration, status: 'pass' });
    console.log(`✅ Database queries completed in ${duration.toFixed(2)}ms`);
  } catch (error) {
    results.push({ test: 'Database Queries', duration: 0, status: 'fail' });
    console.log('❌ Database query test failed');
  }

  // Test 2: Cache Performance
  try {
    console.log('\n📊 Test 2: Cache Performance');
    
    const testData = { users: 100, requests: 50 };
    
    const writeStart = performance.now();
    for (let i = 0; i < 1000; i++) {
      cache.set(`key-${i}`, testData, 60);
    }
    const writeDuration = performance.now() - writeStart;
    
    const readStart = performance.now();
    let hits = 0;
    for (let i = 0; i < 1000; i++) {
      const data = cache.get(`key-${i}`);
      if (data) hits++;
    }
    const readDuration = performance.now() - readStart;
    
    results.push({ test: 'Cache Writes (1000 ops)', duration: writeDuration, status: 'pass' });
    results.push({ test: 'Cache Reads (1000 ops)', duration: readDuration, status: 'pass' });
    
    console.log(`✅ Cache writes: ${writeDuration.toFixed(2)}ms (${(1000/writeDuration*1000).toFixed(0)} ops/sec)`);
    console.log(`✅ Cache reads: ${readDuration.toFixed(2)}ms (${(1000/readDuration*1000).toFixed(0)} ops/sec)`);
    console.log(`✅ Cache hit rate: ${hits}/1000 (${(hits/10).toFixed(1)}%)`);
  } catch (error) {
    console.log('❌ Cache test failed');
  }

  // Test 3: Memory Usage
  try {
    console.log('\n📊 Test 3: Memory Usage');
    
    const memBefore = logMemoryUsage('Before');
    
    // Simulate some load
    const users = await prisma.user.findMany({ take: 100 });
    const requests = await prisma.request.findMany({ take: 100, include: { bids: true } });
    
    const memAfter = logMemoryUsage('After');
    
    results.push({ test: 'Memory Usage', duration: 0, status: 'pass' });
    console.log(`✅ Loaded ${users.length} users and ${requests.length} requests`);
  } catch (error) {
    console.log('❌ Memory test failed');
  }

  // Test 4: Concurrent Operations
  try {
    console.log('\n📊 Test 4: Concurrent Operations');
    
    const start = performance.now();
    
    const promises = [
      prisma.user.count(),
      prisma.request.count(),
      prisma.bid.count(),
      prisma.transaction.count(),
      prisma.category.findMany(),
    ];
    
    await Promise.all(promises);
    
    const duration = performance.now() - start;
    results.push({ test: 'Concurrent Queries (5)', duration, status: 'pass' });
    console.log(`✅ Concurrent queries completed in ${duration.toFixed(2)}ms`);
  } catch (error) {
    results.push({ test: 'Concurrent Queries', duration: 0, status: 'fail' });
    console.log('❌ Concurrent test failed');
  }

  // Test 5: Performance Report
  console.log('\n📊 Performance Monitor Report');
  console.log(monitor.generateReport());

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 Performance Test Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  results.forEach(r => {
    const icon = r.status === 'pass' ? '✅' : '❌';
    const duration = r.duration > 0 ? `(${r.duration.toFixed(2)}ms)` : '';
    console.log(`${icon} ${r.test} ${duration}`);
  });
  
  console.log(`\nTotal: ${passed} passed, ${failed} failed`);
  
  // Performance Recommendations
  console.log('\n💡 Performance Recommendations:');
  console.log('- Enable Redis for production caching');
  console.log('- Use CDN for static assets');
  console.log('- Enable gzip compression');
  console.log('- Monitor slow queries in production');
  
  await prisma.$disconnect();
  
  return { passed, failed, results };
}

if (require.main === module) {
  runPerformanceTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Performance test failed:', error);
      process.exit(1);
    });
}

export { runPerformanceTests };
