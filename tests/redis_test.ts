import redis from '../lib/redis';

async function testRedis() {
  console.log('🚀 Starting Redis System Test...');
  console.log(`📡 Current Connection Status: ${ (redis as any).status || 'connecting'}`);

  try {
    const testKey = 'simulation:test_key';
    const testValue = 'Hello Shoofly ' + Date.now();

    console.log(`\n1️⃣ Testing SET...`);
    await redis.set(testKey, testValue, 'EX', 10); // Expire in 10 seconds
    console.log('✅ SET operation successful.');

    console.log(`\n2️⃣ Testing GET...`);
    const val = await redis.get(testKey);
    console.log(`✅ GET result: "${val}"`);

    if (val === testValue) {
        console.log('✨ Data integrity verified!');
    } else {
        throw new Error('Data mismatch!');
    }

    console.log(`\n3️⃣ Testing DELETE...`);
    await redis.del(testKey);
    const deletedVal = await redis.get(testKey);
    if (!deletedVal) {
        console.log('✅ DELETE operation verified (Key is gone).');
    }

    console.log('\n🏆 REDIS TEST PASSED SUCCESSFULLY!');
    
  } catch (err: any) {
    console.error('\n❌ Redis Test Failed!');
    console.error(err.message);
  } finally {
    // Only quit if it's a real redis client
    if (typeof (redis as any).quit === 'function') {
        await (redis as any).quit();
    }
  }
}

testRedis();
