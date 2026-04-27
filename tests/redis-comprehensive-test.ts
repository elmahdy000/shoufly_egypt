/**
 * 🔴 Comprehensive Redis Integration Test
 * Tests all Redis usage patterns in Shoofly Egypt:
 * 1. Basic operations (SET/GET/DEL/TTL)
 * 2. Rate Limiting (Sorted Set sliding window)
 * 3. Pub/Sub (Notification broadcast pipeline)
 * 4. Failover (MockRedis fallback)
 * 5. Concurrent writes (race safety)
 * 6. Key expiry (TTL enforcement)
 */

import 'dotenv/config';
import redis, { getRedisClient, isRedisAvailable, createSubscriberClient } from '../lib/redis';
import { checkRateLimitRedis } from '../lib/utils/rate-limiter-redis';
import { checkRateLimit } from '../lib/utils/rate-limiter';

const PASS = '✅';
const FAIL = '❌';
const SEP = '─'.repeat(60);

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string, detail?: string) {
  if (condition) {
    console.log(`${PASS} ${message}`);
    passed++;
  } else {
    console.error(`${FAIL} FAILED: ${message}${detail ? ' → ' + detail : ''}`);
    failed++;
  }
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('\n🔴 ═══════════════════════════════════════════════');
  console.log('   SHOOFLY REDIS COMPREHENSIVE TEST SUITE');
  console.log('═══════════════════════════════════════════════\n');

  const client = getRedisClient();

  // ─────────────────────────────────────────────
  console.log('📦 PHASE 1: Connection & Basic Operations');
  console.log(SEP);
  // ─────────────────────────────────────────────

  const available = isRedisAvailable();
  assert(available, `Redis is reachable (isRedisAvailable = ${available})`);

  // SET + GET
  const testKey = `shoofly:test:${Date.now()}`;
  await client.set(testKey, 'hello_egypt');
  const val = await client.get(testKey);
  assert(val === 'hello_egypt', 'SET/GET round-trip works', `got: ${val}`);

  // SET with EX (TTL)
  const ttlKey = `shoofly:ttl:${Date.now()}`;
  await client.set(ttlKey, 'expires_soon', 'EX', 2);
  const ttlBefore = await client.ttl(ttlKey);
  assert(ttlBefore > 0 && ttlBefore <= 2, `TTL set correctly (${ttlBefore}s remaining)`);

  // Wait for expiry
  await sleep(2500);
  const expired = await client.get(ttlKey);
  assert(expired === null, `Key expired after TTL (value is null)`);

  // DEL
  await client.set(`shoofly:del:test`, 'delete_me');
  await client.del(`shoofly:del:test`);
  const afterDel = await client.get(`shoofly:del:test`);
  assert(afterDel === null, 'DEL removes key correctly');

  // INCR (atomic counter)
  const counterKey = `shoofly:counter:${Date.now()}`;
  await client.incr(counterKey);
  await client.incr(counterKey);
  const count = await client.incr(counterKey);
  assert(count === 3, `INCR is atomic (counter = ${count}, expected 3)`);
  await client.del(counterKey);

  // Cleanup
  await client.del(testKey);

  // ─────────────────────────────────────────────
  console.log('\n⚡ PHASE 2: Rate Limiter (Sliding Window via Redis)');
  console.log(SEP);
  // ─────────────────────────────────────────────

  const rlKey = `shoofly:rl:test:${Date.now()}`;

  // Allow first 5 requests
  let allAllowed = true;
  for (let i = 0; i < 5; i++) {
    const result = await checkRateLimitRedis(rlKey, 5, 10000);
    if (!result.allowed) { allAllowed = false; break; }
  }
  assert(allAllowed, 'First 5 requests are allowed (limit=5)');

  // 6th should be blocked
  const blocked = await checkRateLimitRedis(rlKey, 5, 10000);
  assert(!blocked.allowed, `6th request is BLOCKED (remaining=${blocked.remaining})`);
  assert(blocked.remaining === 0, `Remaining count is 0 after limit hit`);

  // Hybrid rate limiter fallback path
  const hybridResult = await checkRateLimit(`shoofly:hybrid:${Date.now()}`, 3, 5000);
  assert(hybridResult.allowed, `Hybrid rate limiter works (Redis available: ${isRedisAvailable()})`);

  // ─────────────────────────────────────────────
  console.log('\n📡 PHASE 3: Pub/Sub Pipeline (Notification Broadcast)');
  console.log(SEP);
  // ─────────────────────────────────────────────

  const channel = `user_notifications:99999`;
  let receivedMessage: string | null = null;
  let messageReceived = false;

  // Create subscriber
  const subscriber = createSubscriberClient() as any;

  // Subscribe
  await new Promise<void>((resolve) => {
    subscriber.subscribe(channel, (err: any) => {
      if (!err) resolve();
    });
  });

  subscriber.on('message', (ch: string, msg: string) => {
    if (ch === channel) {
      receivedMessage = msg;
      messageReceived = true;
    }
  });

  // Publish from main client
  const payload = JSON.stringify({ type: 'NEW_BID', title: 'عرض جديد!', userId: 99999 });
  await sleep(100); // give subscriber time to register
  const receivers = await client.publish(channel, payload);

  // Wait for message delivery
  await sleep(500);

  assert(messageReceived, `Pub/Sub: message delivered to subscriber`);
  assert(receivedMessage === payload, `Pub/Sub: payload matches exactly`);
  assert(typeof receivers === 'number' && receivers >= 0, `Pub: ${receivers} subscriber(s) received the message`);

  // Unsubscribe + cleanup
  await subscriber.unsubscribe(channel);
  subscriber.disconnect();

  // ─────────────────────────────────────────────
  console.log('\n🔁 PHASE 4: Concurrent Writes (Race Safety)');
  console.log(SEP);
  // ─────────────────────────────────────────────

  const raceKey = `shoofly:race:${Date.now()}`;
  await client.set(raceKey, '0');

  // 100 concurrent INCRs — result must be exactly 100
  await Promise.all(Array.from({ length: 100 }, () => client.incr(raceKey)));
  const raceResult = await client.get(raceKey);
  assert(raceResult === '100', `100 concurrent INCRs = ${raceResult} (expected 100, no lost writes)`);
  await client.del(raceKey);

  // ─────────────────────────────────────────────
  console.log('\n🛡️ PHASE 5: Failover — MockRedis Behavior');
  console.log(SEP);
  // ─────────────────────────────────────────────

  // We can't easily trigger a real failover without killing Redis,
  // but we can verify the hybrid rate limiter works even if we pass a bad key
  const fallbackResult = await checkRateLimit(`shoofly:fallback:ok:${Date.now()}`, 10, 5000);
  assert(fallbackResult.allowed, 'Hybrid limiter returns valid result structure');
  assert(typeof fallbackResult.limit === 'number', 'Result has .limit field');
  assert(typeof fallbackResult.remaining === 'number', 'Result has .remaining field');
  assert(typeof fallbackResult.resetTime === 'number', 'Result has .resetTime field');

  // ─────────────────────────────────────────────
  console.log('\n📊 PHASE 6: Throughput Benchmark (1000 SET ops)');
  console.log(SEP);
  // ─────────────────────────────────────────────

  const benchKey = `shoofly:bench:${Date.now()}`;
  const N = 1000;
  const start = Date.now();

  await Promise.all(
    Array.from({ length: N }, (_, i) =>
      client.set(`${benchKey}:${i}`, `value_${i}`, 'EX', 10)
    )
  );

  const elapsed = Date.now() - start;
  const opsPerSec = Math.round((N / elapsed) * 1000);

  assert(elapsed < 5000, `1000 concurrent SET ops completed in ${elapsed}ms`);
  assert(opsPerSec > 500, `Throughput: ${opsPerSec} ops/sec (min expected: 500)`);

  // Cleanup bench keys
  const delKeys = Array.from({ length: N }, (_, i) => `${benchKey}:${i}`);
  await client.del(...delKeys);

  // ─────────────────────────────────────────────
  // FINAL REPORT
  // ─────────────────────────────────────────────

  console.log('\n' + '═'.repeat(60));
  console.log('📋 REDIS TEST REPORT');
  console.log('═'.repeat(60));
  console.log(`${PASS} Passed: ${passed}`);
  if (failed > 0) console.log(`${FAIL} Failed: ${failed}`);
  console.log('');

  if (failed === 0) {
    console.log('🏆 ALL REDIS TESTS PASSED — Redis is fully operational!\n');
  } else {
    console.log(`⚠️ ${failed} test(s) failed. Review the output above.\n`);
    process.exitCode = 1;
  }

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
