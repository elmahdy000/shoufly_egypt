import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { d, toTwo, sub, toNumber } from '@/lib/utils/decimal';
import { Notify } from '../notifications/hub';

const MIN_WITHDRAWAL_AMOUNT = 50; // Minimum 50 EGP to prevent micro-transactions

export async function requestWithdrawal(vendorId: number, amount: number) {
  logger.info('withdrawal.request.started', { vendorId, amount });
  return prisma.$transaction(async (tx) => {
    const vendor = await tx.user.findUnique({
      where: { id: vendorId },
      select: { id: true, role: true, walletBalance: true, isActive: true },
    });

    if (!vendor || vendor.role !== 'VENDOR' || !vendor.isActive) {
      throw new Error('فقط الموردين النشطين يمكنهم طلب سحب الرصيد.');
    }

    const wallet = toTwo(Number(vendor.walletBalance));
    const requested = toTwo(amount);

    // Validate minimum withdrawal amount
    if (requested.lt(MIN_WITHDRAWAL_AMOUNT)) {
      throw new Error(`الحد الأدنى للسحب هو ${MIN_WITHDRAWAL_AMOUNT} ج.م`);
    }

    if (requested.gt(wallet)) {
      throw new Error('المبلغ المطلوب يتجاوز الرصيد المتاح في محفظتك.');
    }

    // Prevent opening a new withdrawal while one is already PENDING
    const existingPending = await tx.withdrawalRequest.findFirst({
      where: { vendorId, status: 'PENDING' },
      select: { id: true, amount: true },
    });
    if (existingPending) {
      throw new Error(
        `لديك طلب سحب قيد المراجعة بالفعل (رقم #${existingPending.id} بمبلغ ${existingPending.amount} ج.م). يرجى انتظار مراجعته قبل تقديم طلب جديد.`
      );
    }


    const created = await tx.withdrawalRequest.create({
      data: {
        vendorId,
        amount: requested.toNumber(),
        status: 'PENDING',
      },
    });

    // CRITICAL: Deduct from wallet immediately (hold funds)
    const updateResult = await tx.user.updateMany({
      where: { 
        id: vendorId,
        walletBalance: { gte: requested.toNumber() } 
      },
      data: { walletBalance: { decrement: requested.toNumber() } }
    });

    if (updateResult.count === 0) {
      throw new Error('الرصيد المتاح غير كافٍ أو تغير أثناء معالجة الطلب.');
    }


    const admins = await tx.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    if (admins.length > 0) {
      await Notify.bulkSend(admins.map((a) => ({
        userId: a.id,
        type: 'WITHDRAWAL_REQUESTED',
        title: 'طلب سحب جديد 💸',
        message: `المورد #${vendorId} طلب سحب مبلغ ${requested} ج.م.`,
      })), tx);
      logger.info('notification.created', {
        event: 'withdrawal.requested',
        withdrawalId: created.id,
        recipients: admins.map((a) => a.id),
        role: 'ADMIN',
      });
    }

    logger.info('withdrawal.request.completed', {
      withdrawalId: created.id,
      vendorId,
      amount: requested,
      status: created.status,
    });

    return {
      id: created.id,
      vendorId: created.vendorId,
      amount: Number(created.amount),
      status: created.status,
      availableBalance: toNumber(sub(wallet, requested)),
    };

  });
}
