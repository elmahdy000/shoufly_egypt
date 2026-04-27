import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { createSessionToken, verifySessionToken } from '../lib/session';
import 'dotenv/config';

async function runAuthFlowTest() {
  console.log('🔐 Starting Expert Authentication Flow Audit...\n');

  const secret = process.env.SESSION_SECRET || 'test-secret-key-123';
  const timestamp = Date.now();
  const testEmail = `auth-test-${timestamp}@shoofly.com`;
  const testPass = 'securePassword123';

  try {
    // 1. Setup Test User
    console.log('👤 Creating test user with hashed password...');
    const hashed = await bcrypt.hash(testPass, 10);
    const user = await prisma.user.create({
      data: {
        fullName: 'Auth Test User',
        email: testEmail,
        password: hashed,
        role: 'CLIENT',
        isActive: true
      }
    });

    // 2. Test Success Path
    console.log('✅ Testing successful password verification...');
    const isValid = await bcrypt.compare(testPass, user.password);
    if (!isValid) throw new Error('Password comparison failed on valid pass');
    console.log('   Result: Password verified successfully.');

    // 3. Test Failure Path
    console.log('❌ Testing invalid password rejection...');
    const isInvalid = await bcrypt.compare('wrong-pass', user.password);
    if (isInvalid) throw new Error('Password comparison succeeded on WRONG pass');
    console.log('   Result: Invalid password correctly rejected.');

    // 4. Test Session Token Generation
    console.log('🎫 Testing JWT Session generation...');
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = await createSessionToken({ userId: user.id, role: user.role, exp }, secret);
    console.log(`   Token generated: ${token.substring(0, 20)}...`);

    // 5. Test Token Verification
    console.log('🔍 Testing JWT Verification & Role extraction...');
    const payload = await verifySessionToken(token, secret);
    if (!payload || payload.userId !== user.id || payload.role !== user.role) {
        throw new Error('Token verification failed or payload mismatch');
    }
    console.log(`   Result: Token verified for User #${payload.userId} [${payload.role}]`);

    // 6. Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    console.log('\n✨ Auth flow audit complete. Security integrity confirmed.');

  } catch (err) {
    console.error('💥 Auth Audit Failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAuthFlowTest();
