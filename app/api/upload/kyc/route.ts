import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const formData = await req.formData();
    const frontFile = formData.get('front') as File;
    const backFile = formData.get('back') as File;

    if (!frontFile || !backFile) {
      return NextResponse.json({ error: 'يجب رفع صورة وجه وظهر البطاقة' }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'kyc');
    await mkdir(uploadDir, { recursive: true });

    const frontPath = join(uploadDir, `${user.id}-front-${Date.now()}.jpg`);
    const backPath = join(uploadDir, `${user.id}-back-${Date.now()}.jpg`);

    const frontBuffer = Buffer.from(await frontFile.arrayBuffer());
    const backBuffer = Buffer.from(await backFile.arrayBuffer());

    await writeFile(frontPath, frontBuffer);
    await writeFile(backPath, backBuffer);

    // Save relative paths for public access
    const frontUrl = `/uploads/kyc/${frontPath.split(/[\\/]/).pop()}`;
    const backUrl = `/uploads/kyc/${backPath.split(/[\\/]/).pop()}`;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        idCardFrontUrl: frontUrl,
        idCardBackUrl: backUrl,
        verificationStatus: 'PENDING',
        kycSubmissionDate: new Date(),
      }
    });

    return NextResponse.json({ success: true, frontUrl, backUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
