import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Notify } from '@/lib/services/notifications/hub';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getCurrentUser(req.headers);
    requireUser(admin);
    requireRole(admin, 'ADMIN');

    const { userId: userIdParam } = await params;
    const userId = parseInt(userIdParam, 10);
    const body = await req.json();
    const { status, reason } = body; // status: 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
          verificationStatus: status,
          isVerified: status === 'APPROVED'
      },
    });

    // Notify the user
    await Notify.send({
        userId: user.id,
        type: status === 'APPROVED' ? 'KYC_APPROVED' : 'KYC_REJECTED',
        title: status === 'APPROVED' ? 'تم توثيق حسابك! 🎉' : 'فشل توثيق الحساب ❌',
        message: status === 'APPROVED' 
            ? 'مبروك، تم توثيق حسابك بنجاح. يمكنك الآن سحب أرباحك في أي وقت.'
            : `للأسف، تم رفض طلب التوثيق. السبب: ${reason || 'البيانات غير واضحة'}. يرجى المحاولة مرة أخرى.`
    });

    return NextResponse.json({ success: true, status: user.verificationStatus });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
