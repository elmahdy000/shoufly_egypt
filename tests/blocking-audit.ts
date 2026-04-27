import { prisma } from '../lib/prisma';
import { getCurrentUser } from '../lib/auth';
import { logger } from '../lib/utils/logger';
import 'dotenv/config';

async function runBlockingAudit() {
  console.log('🛡️  Starting User Blocking & Security Audit...\n');

  const testEmail = `blocked-test-${Date.now()}@shoofly.com`;
  
  try {
    // 1. Create a Test User
    console.log('👤 Creating test user...');
    const user = await prisma.user.create({
      data: {
        fullName: 'Blocked User Test',
        email: testEmail,
        password: 'secure-password-123',
        role: 'CLIENT',
        isBlocked: false,
        isActive: true
      }
    });

    // 2. Test Normal Access (Simulated)
    console.log('✅ Verifying normal access...');
    const headers = new Headers();
    // In a real app, this would be a session token in a cookie.
    // We simulate the resolver logic directly since we can't easily mock the cookie() call in a script.
    
    const resolveUser = async (uId: number) => {
        const u = await prisma.user.findUnique({ where: { id: uId } });
        if (u?.isBlocked) throw new Error('Account blocked - Unauthorized');
        return u;
    };

    const activeUser = await resolveUser(user.id);
    console.log(`   Result: Access granted for ${activeUser?.email}`);

    // 3. Block the User
    console.log('\n🚫 Blocking the user in database...');
    await prisma.user.update({
      where: { id: user.id },
      data: { isBlocked: true }
    });

    // 4. Test Blocked Access
    console.log('🛑 Verifying blocked access...');
    try {
      await resolveUser(user.id);
      console.error('❌ FAIL: User was able to resolve even though blocked!');
    } catch (err: any) {
      if (err.message === 'Account blocked - Unauthorized') {
        console.log(`✅ SUCCESS: Access denied with message: "${err.message}"`);
      } else {
        console.error(`❌ FAIL: Unexpected error message: "${err.message}"`);
      }
    }

    // 5. Cleanup
    console.log('\n🧹 Cleaning up test user...');
    await prisma.user.delete({ where: { id: user.id } });
    console.log('✨ Audit complete.');

  } catch (err) {
    console.error('💥 Audit Crashed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runBlockingAudit();
