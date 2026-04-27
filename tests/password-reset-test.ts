import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

async function runPasswordResetAudit() {
  console.log('🔄 Starting Password Reset Workflow Audit...\n');

  const secret = process.env.JWT_SECRET || 'test-jwt-secret';
  const timestamp = Date.now();
  const testEmail = `reset-test-${timestamp}@test.com`;
  const initialPass = 'OldPassword123';
  const newPass = 'NewSecurePass456!';

  try {
    // 1. Setup User
    console.log('👤 Creating user with initial password...');
    const hashedInitial = await bcrypt.hash(initialPass, 10);
    const user = await prisma.user.create({
      data: {
        fullName: 'Reset Test',
        email: testEmail,
        password: hashedInitial,
        role: 'CLIENT'
      }
    });

    // 2. Simulate Reset Request
    console.log('📨 Simulating password reset request (Step 1)...');
    const resetToken = jwt.sign({ resetUserId: user.id }, secret, { expiresIn: '15m' });
    console.log(`   ✅ Reset token generated successfully.`);

    // 3. Simulate Reset Execution
    console.log('🔑 Simulating password update with token (Step 2)...');
    const decoded = jwt.verify(resetToken, secret) as { resetUserId: number };
    if (decoded.resetUserId !== user.id) throw new Error('Token payload mismatch');

    const hashedNew = await bcrypt.hash(newPass, 10);
    await prisma.user.update({
        where: { id: decoded.resetUserId },
        data: { password: hashedNew }
    });
    console.log('   ✅ Password updated in database.');

    // 4. Verify New Credentials
    console.log('🧪 Verifying new password works...');
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!updatedUser) throw new Error('User lost after update');

    const isValid = await bcrypt.compare(newPass, updatedUser.password);
    if (!isValid) throw new Error('New password verification failed');
    
    const isOldValid = await bcrypt.compare(initialPass, updatedUser.password);
    if (isOldValid) throw new Error('Old password still works! Security risk.');

    console.log('   ✅ New password verified. Old password invalidated.');

    // 5. Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    console.log('\n✨ Password reset audit complete.');

  } catch (err) {
    console.error('💥 Audit Failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runPasswordResetAudit();
