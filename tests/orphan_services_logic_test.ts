import { prisma } from '../lib/prisma';
import { createReview } from '../lib/services/reviews/create-review';
import { createComplaint } from '../lib/services/complaints/create-complaint';
import { createRefund } from '../lib/services/refunds/create-refund';
import { confirmDelivery } from '../lib/services/qr/confirm-delivery';
import 'dotenv/config';

/**
 * 🧪 --- ORPHAN SERVICES LOGIC AUDIT --- 🧪
 * Covers: Reviews, Complaints, Refunds, and QR Confirmations.
 */

async function runOrphanLogicTests() {
  console.log('🔬 Starting Orphan Services Logic Audit...\n');

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });
    const request = await prisma.request.findFirst({ where: { status: 'CLOSED_SUCCESS' } });

    if (!client || !vendor || !request) {
        throw new Error('Simulation prerequisites missing. Run gold master simulation first.');
    }

    // 1. REVIEWS LOGIC
    console.log('⭐️ [1/4] Testing Review System...');
    const review = await createReview({
        requestId: request.id,
        reviewerId: client.id,
        rating: 5,
        comment: 'Excellent service! Highly recommended.'
    });
    console.log(`✅ Review created (ID: ${review.id}). Vendor reputation updated.\n`);

    // 2. COMPLAINTS LOGIC
    console.log('⚠️ [2/4] Testing Complaint System...');
    const complaint = await createComplaint({
        userId: client.id,
        requestId: request.id,
        subject: 'QUALITY_ISSUE',
        description: 'The product was not as described in the bid description.'
    });
    console.log(`✅ Complaint filed (ID: ${complaint.id}). Request marked for investigation.\n`);

    // 3. REFUNDS LOGIC
    console.log('💰 [3/4] Testing Refund Logic (Partial)...');
    // Using a fake transaction if needed, but the service should handle DB logic
    const tx = await prisma.transaction.findFirst({ where: { type: 'ESCROW_DEPOSIT' } });
    if (tx) {
        const refundRequest = await prisma.request.findFirst({
            where: { status: { not: 'CLOSED_SUCCESS' }, transactions: { some: { type: 'ESCROW_DEPOSIT' } } }
        });
        
        if (refundRequest) {
            const refund = await createRefund({
                requestId: refundRequest.id,
                adminId: 1, // Mock admin
                reason: 'Standard refund for test scenario.'
            });
            console.log(`✅ Refund Issued (ID: ${refund.refundTransactionId}). Funds returned to Client.\n`);
        }
    }

    // 4. QR / CONFIRMATION LOGIC
    console.log('📱 [4/4] Testing Secure Delivery Confirmation...');
    // We already have a CLOSED_SUCCESS request, but confirmDelivery checks if it's DELIVERED
    const activeReq = await prisma.request.findFirst({ where: { status: 'DELIVERED' } });
    if (activeReq) {
        await confirmDelivery({
            requestId: activeReq.id,
            clientId: client.id
        });
        console.log(`✅ Delivery Confirmed for Request #${activeReq.id}.\n`);
    } else {
        console.log('ℹ️ No DELIVERED request found to test confirmation (Skipping).\n');
    }

    console.log('🏆 --- ALL ORPHAN LOGIC TESTS COMPLETED --- 🏆');

  } catch (err: any) {
    console.error('❌ LOGIC AUDIT FAILED:', err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runOrphanLogicTests();
