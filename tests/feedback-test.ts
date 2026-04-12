import { prisma } from '../lib/prisma';
import { createReview } from '../lib/services/reviews/create-review';
import { createComplaint } from '../lib/services/complaints/create-complaint';
import 'dotenv/config';

async function testFeedback() {
  console.log('📝 TESTING RATINGS & COMPLAINTS SYSTEM...\n');

  try {
    // 1. Find a successfully closed request from simulation
    const request = await prisma.request.findFirst({
        where: { status: 'CLOSED_SUCCESS' },
        include: { client: true }
    });

    if (!request) throw new Error('No closed request found. Run simulation.ts first.');

    // 2. Client leaves a Review
    console.log(`--- Step 1: Client (#${request.clientId}) leaving a 5-star Review ---`);
    const review = await createReview({
        requestId: request.id,
        reviewerId: request.clientId,
        rating: 5,
        comment: 'Excellent service and very professional vendor!'
    });
    console.log('✅ Review created successfully:', review.comment);

    // 3. Client files a Complaint
    console.log(`\n--- Step 2: Client (#${request.clientId}) filing a Complaint ---`);
    const complaint = await createComplaint({
        requestId: request.id,
        userId: request.clientId,
        subject: 'Delivery Delay',
        description: 'The order arrived 30 minutes later than promised.'
    });
    console.log('✅ Complaint recorded successfully:', complaint.subject);

    // 4. Verification Check
    const vendorStats = await prisma.review.aggregate({
        where: { reviewedId: review.reviewedId },
        _avg: { rating: true },
        _count: true
    });
    console.log(`\n📊 Vendor Performance Summary:`);
    console.log(`- Average Rating: ${vendorStats._avg.rating?.toFixed(1)} / 5`);
    console.log(`- Total Reviews: ${vendorStats._count}`);

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testFeedback();
