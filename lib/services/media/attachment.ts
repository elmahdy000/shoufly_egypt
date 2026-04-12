import { prisma } from '@/lib/prisma';

export interface ImageInput {
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export async function attachImagesToRequest(requestId: number, images: ImageInput[]) {
  if (images.length === 0) return [];

  return prisma.requestImage.createMany({
    data: images.map(img => ({
      requestId,
      filePath: img.filePath,
      fileName: img.fileName,
      mimeType: img.mimeType,
      fileSize: img.fileSize,
    }))
  });
}

export async function attachImagesToBid(bidId: number, images: ImageInput[]) {
  if (images.length === 0) return [];

  return prisma.bidImage.createMany({
    data: images.map(img => ({
      bidId,
      filePath: img.filePath,
      fileName: img.fileName,
      mimeType: img.mimeType,
      fileSize: img.fileSize,
    }))
  });
}
