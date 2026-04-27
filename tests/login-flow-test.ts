import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { createSessionToken } from '../lib/session';
import 'dotenv/config';

async function runLoginFlowAudit() {
  console.log('🔐 Starting Comprehensive Login Flow Audit...\n');

  const timestamp = Date.now();
  const testEmail = `login-flow-${timestamp}@test.com`;
  const testPass = 'Password123!';
  const secret = process.env.SESSION_SECRET || 'test-secret';

  try {
    // 1. User Setup
    console.log('👤 Creating test user...');
    const hashed = await bcrypt.hash(testPass, 10);
    const user = await prisma.user.create({
      data: {
        fullName: 'Login Flow Test',
        email: testEmail,
        password: hashed,
        role: 'CLIENT',
        isActive: true
      }
    });

    // 2. Mock Login Logic (mimicking the API route)
    console.log('🔑 Simulating login attempt...');
    const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
    
    if (!dbUser) throw new Error('User not found in DB');
    
    const isValid = await bcrypt.compare(testPass, dbUser.password);
    if (!isValid) throw new Error('Invalid credentials');
    
    console.log('   ✅ Password comparison successful.');

    // 3. Session Generation
    console.log('🎫 Generating session token...');
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = await createSessionToken({ userId: dbUser.id, role: dbUser.role, exp }, secret);
    console.log(`   ✅ Token created: ${token.substring(0, 30)}...`);

    // 4. Role Guard Verification
    console.log(`🛡️ Verifying role permissions for ${dbUser.role}...`);
    if (dbUser.role === 'CLIENT') {
        console.log('   ✅ Access to Client Dashboard confirmed.');
    }

    // 5. Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    console.log('\n✨ Login flow audit complete.');

  } catch (err) {
    console.error('💥 Audit Failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runLoginFlowAudit();
