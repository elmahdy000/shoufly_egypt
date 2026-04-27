import { prisma } from '../lib/prisma';
import { createReview } from '../lib/services/reviews/create-review';
import 'dotenv/config';

async function runExpertReviewsTest() {
  console.log('⭐  Starting Expert Reviews & Ratings Logic Audit...\n');

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });
    const category = await prisma.category.findFirst({ where: { parentId: { not: null } } });

    if (!client || !vendor || !category) throw new Error('Basic test data missing');

    // 1. Scenario: Request is NOT closed yet
    console.log('🧪 Test 1: Blocking review for non-completed order...');
    const openReq = await prisma.request.create({
      data: {
        title: 'Open Job',
        description: 'Still active',
        clientId: client.id,
        categoryId: category.id,
        address: 'Cairo',
        latitude: 0, longitude: 0, deliveryPhone: '010',
        status: 'OPEN_FOR_BIDDING'
      }
    });

    try {
      await createReview({
        requestId: openReq.id,
        reviewerId: client.id,
        rating: 5
      });
      console.error('   ❌ FAIL: System allowed reviewing an open request!');
    } catch (err: any) {
      console.log(`   ✅ SUCCESS: Blocked with message: "${err.message}"`);
    }

    // 2. Scenario: Valid review flow
    console.log('\n🧪 Test 2: Validating full review flow...');
    
    // Update request to be reviewable
    await prisma.request.update({
        where: { id: openReq.id },
        data: { 
            status: 'CLOSED_SUCCESS',
            bids: {
                create: {
                    vendorId: vendor.id,
                    description: 'Test bid',
                    netPrice: 100,
                    clientPrice: 115,
                    status: 'ACCEPTED_BY_CLIENT'
                }
            }
        }
    });

    const validReview = await createReview({
        requestId: openReq.id,
        reviewerId: client.id,
        rating: 5,
        comment: 'Amazing service!'
    });
    console.log(`   ✅ SUCCESS: Review created for Vendor: ${validReview.reviewed.fullName}`);

    // 3. Scenario: Unauthorized Reviewer
    console.log('\n🧪 Test 3: Blocking review from unauthorized user...');
    try {
        const otherUser = await prisma.user.findFirst({ where: { NOT: { id: client.id }, role: 'CLIENT' } });
        if (otherUser) {
            await createReview({
                requestId: openReq.id,
                reviewerId: otherUser.id,
                rating: 1
            });
            console.error('   ❌ FAIL: Unauthorized user allowed to review!');
        } else {
            console.log('   ⚠️ Skipping: No second client found for test.');
        }
    } catch (err: any) {
        console.log(`   ✅ SUCCESS: Blocked unauthorized user: "${err.message}"`);
    }

    // 4. Cleanup
    console.log('\n🧹 Cleaning up...');
    await prisma.review.delete({ where: { id: validReview.id } });
    await prisma.bid.deleteMany({ where: { requestId: openReq.id } });
    await prisma.request.delete({ where: { id: openReq.id } });
    console.log('✨ Expert Reviews Audit complete.');

  } catch (err) {
    console.error('💥 Audit Crashed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runExpertReviewsTest();
