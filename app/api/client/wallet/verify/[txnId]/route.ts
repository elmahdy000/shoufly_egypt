import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ txnId: string }> }
) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'CLIENT');

    const { txnId } = await params;
    const transactionId = parseInt(txnId);

    if (isNaN(transactionId)) {
      return NextResponse.json({ success: false, message: 'معرف المعاملة غير صالح' }, { status: 400 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id,
      },
    });

    if (!transaction) {
      return NextResponse.json({ success: false, message: 'الماملة غير موجودة' }, { status: 404 });
    }

    const meta = transaction.metadata as Record<string, unknown> | null;
    const isPaid = meta?.paymobStatus === 'SUCCESS' || meta?.fawryStatus === 'SUCCESS';

    if (isPaid) {
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { walletBalance: true },
      });

      return NextResponse.json({
        success: true,
        message: 'تم تأكيد الدفع بنجاح',
        balance: Number(updatedUser?.walletBalance ?? 0),
      });
    }

    const isPending = meta?.paymobStatus === 'PENDING' || meta?.fawryStatus === 'PENDING';
    if (isPending) {
      return NextResponse.json({
        success: false,
        message: 'الدفع قيد المعالجة',
        pending: true,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'الدفع لم يكتمل',
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}