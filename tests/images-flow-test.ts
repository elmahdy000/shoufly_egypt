import { prisma } from '../lib/prisma';
import { CreateRequestSchema } from '../lib/validations/request';
import 'dotenv/config';

async function runImagesFlowTest() {
  console.log('🖼️ Starting Media & Image Attachment Audit...\n');

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const category = await prisma.category.findFirst({ where: { parentId: { not: null } } });
    const location = await prisma.city.findFirst({ include: { governorate: true } });

    if (!client || !category || !location) throw new Error('Test environment incomplete');

    // 1. Validation Logic Test
    console.log('🧪 Testing Schema Validation for image metadata...');
    const validData = {
        title: "Test with Image",
        description: "Testing images list",
        categoryId: category.id,
        address: "Address",
        latitude: 30, longitude: 31,
        deliveryPhone: "01000000000",
        governorateId: location.governorateId,
        cityId: location.id,
        images: [
            { filePath: "/uploads/img1.jpg", fileName: "img1.jpg", mimeType: "image/jpeg", fileSize: 1024 * 500 }
        ]
    };

    const validated = CreateRequestSchema.parse(validData);
    console.log(`   Result: Schema validated ${validated.images?.length} image(s) correctly.`);

    // 2. Database Insertion Test
    console.log('💾 Saving request with multiple images to DB...');
    const request = await prisma.request.create({
        data: {
            clientId: client.id,
            title: validData.title,
            description: validData.description,
            categoryId: category.id,
            address: validData.address,
            latitude: validData.latitude,
            longitude: validData.longitude,
            deliveryPhone: validData.deliveryPhone,
            governorateId: location.governorateId,
            cityId: location.id,
            images: {
                create: [
                    { filePath: "/u/1.jpg", fileName: "1.jpg", mimeType: "image/jpeg", fileSize: 500 },
                    { filePath: "/u/2.jpg", fileName: "2.jpg", mimeType: "image/jpeg", fileSize: 800 }
                ]
            }
        },
        include: { images: true }
    });

    console.log(`   Saved: Request #${request.id} has ${request.images.length} images in database.`);

    // 3. Integrity Check
    if (request.images[0].requestId !== request.id) throw new Error('Image relation broken');
    console.log('   Result: Foreign key integrity confirmed.');

    // 4. Cleanup
    await prisma.request.delete({ where: { id: request.id } });
    console.log('\n✨ Image flow audit complete.');

  } catch (err) {
    console.error('💥 Images Audit Failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runImagesFlowTest();
