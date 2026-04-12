import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests';

import 'dotenv/config';

async function testImageLogic() {
  console.log('🖼️ Testing Image Metadata Storage...');

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const category = await prisma.category.findFirst();

    if (!client || !category) throw new Error('Run simulation.ts first');

    const request = await createRequest(client.id, {
      title: 'Request with Real Images',
      description: 'Check if images are linked in DB',
      categoryId: category.id,
      address: 'Test City',
      latitude: 0,
      longitude: 0,
      deliveryPhone: '0100000000',
      images: [
        {
          filePath: '/uploads/items/laptop_1.png',
          fileName: 'laptop_1.png',
          mimeType: 'image/png',
          fileSize: 204800
        },
        {
          filePath: '/uploads/items/laptop_2.png',
          fileName: 'laptop_2.png',
          mimeType: 'image/png',
          fileSize: 153600
        }
      ]
    });

    console.log('\n✅ Request Created with Images:');
    console.log(`ID: #${request?.id}`);
    console.log(`Images Count: ${request?.images?.length}`);
    request?.images?.forEach((img, i) => {
      console.log(`  [${i+1}] Path: ${img.filePath} (${(img.fileSize/1024).toFixed(1)} KB)`);
    });

  } catch (error) {
    console.error('❌ Image Test Failed');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testImageLogic();
