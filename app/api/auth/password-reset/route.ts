import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

// 1. Request Reset Link (Generates Token)
export async function POST(request: NextRequest) {
  try {
    const { action, email, newPassword, token } = await request.json();

    // STEP A: Requesting a reset link
    if (action === 'request') {
        const user = await prisma.user.findUnique({ where: { email } });
        
        // Always return success to prevent user enumeration
        if (!user) {
            return NextResponse.json({ success: true, message: 'If an account exists, a reset email has been sent' });
        }

        // Generate 15-minute token containing the user ID
        const resetToken = jwt.sign({ resetUserId: user.id }, getJwtSecret(), { expiresIn: '15m' });
        
        // In reality, email this token. For now, we mock the email:
        console.log(`[EMAIL MOCK] Password reset link for ${email}: https://shoofly.com/reset?token=${resetToken}`);

        return NextResponse.json({ success: true, message: 'If an account exists, a reset email has been sent' });
    }

    // STEP B: Submitting the new password with token
    if (action === 'execute') {
        if (!token || !newPassword) return NextResponse.json({ error: 'Token and new password required' }, { status: 400 });

        try {
            const decoded = jwt.verify(token, getJwtSecret()) as { resetUserId: number };
            
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            await prisma.user.update({
                where: { id: decoded.resetUserId },
                data: { password: hashedPassword }
            });

            return NextResponse.json({ success: true, message: 'Password updated successfully' });

        } catch (err) {
            return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 401 });
        }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
