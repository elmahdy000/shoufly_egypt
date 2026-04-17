import { prisma } from '@/lib/prisma';
import { CreateRequestInput } from '@/lib/validations/request';
import { logger } from '@/lib/utils/logger';
import { ImageInput } from '../media/attachment';

export async function createRequest(clientId: number, data: CreateRequestInput & { images?: ImageInput[] }) {
  logger.info('request.created.started', { clientId, categoryId: data.categoryId });

  // 0. Security check: Is user active?
  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { isActive: true, isBlocked: true }
  });

  if (!client || !client.isActive || client.isBlocked) {
    throw new Error('حسابك غير نشط أو محظور حالياً. لا يمكنك إنشاء طلبات جديدة.');
  }

  // 1. Enforce Sub-category selection
  const chosenCategory = await prisma.category.findUnique({
    where: { id: data.categoryId },
    select: { parentId: true, name: true }
  });

  if (!chosenCategory) throw new Error('القسم المختار غير موجود.');
  if (chosenCategory.parentId === null) {
    throw new Error(`يرجى اختيار قسم فرعي محدد داخل قسم "${chosenCategory.name}" لضمان وصول طلبك للموردين الصحيحين.`);
  }

  // 2. Validate Location Consistency (Governorate must own City)
  if (data.cityId && data.governorateId) {
    const city = await prisma.city.findUnique({
        where: { id: data.cityId },
        select: { governorateId: true }
    });
    if (city && city.governorateId !== data.governorateId) {
        throw new Error('المدينة المختارة لا تتبع المحافظة المختارة، يرجى مراجعة اختيار الموقع.');
    }
  }

  return prisma.$transaction(async (tx) => {
    const request = await tx.request.create({
      data: {
        clientId,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        deliveryPhone: data.deliveryPhone,
        notes: data.notes || null,
        governorateId: data.governorateId,
        cityId: data.cityId,
        status: 'PENDING_ADMIN_REVISION',
      },
    });

    if (data.images && data.images.length > 0) {
      await tx.requestImage.createMany({
        data: data.images.map(img => ({
          requestId: request.id,
          filePath: img.filePath,
          fileName: img.fileName,
          mimeType: img.mimeType,
          fileSize: img.fileSize,
        }))
      });
    }

    logger.info('request.created.completed', {
      requestId: request.id,
      clientId,
      status: request.status,
      imageCount: data.images?.length || 0
    });

    return tx.request.findUnique({
      where: { id: request.id },
      include: {
        category: true,
        images: true,
        client: { select: { id: true, fullName: true, email: true } },
      }
    });
  });
}

