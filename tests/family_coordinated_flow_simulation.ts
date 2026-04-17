import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests/create-request';
import { createBid } from '../lib/services/bids/create-bid';
import { payRequest } from '../lib/services/payments/pay-request';
import { reviewRequest } from '../lib/services/admin/review-request';
import { acceptOffer } from '../lib/services/offers/accept-offer';
import { settleOrder } from '../lib/services/transactions/settle-order';
import 'dotenv/config';

/**
 * 👨‍👩‍👧‍👦 --- SHOOFLY EGYPT FAMILY COORDINATED FLOW --- 🛡️
 * Scenario: Family members collaborating on a single fulfillment.
 * 1. Father (Primary) provides the funds.
 * 2. Daughter (Secondary) identifies the service needed (e.g., Home Maintenance).
 * 3. Father approves the selected vendor and pays from the shared pool.
 */

async function runFamilyScenario() {
    console.log('👪 Starting Family Coordinated Flow Simulation...\n');

    try {
        // --- SETUP FAMILY ROLES ---
        const father = await prisma.user.create({
            data: {
                fullName: 'Father (Family Payer)', email: `father_${Date.now()}@family.com`, password: '123',
                role: 'CLIENT', walletBalance: 2000, isActive: true
            }
        });

        const daughter = await prisma.user.create({
            data: {
                fullName: 'Daughter (Requestor)', email: `daughter_${Date.now()}@family.com`, password: '123',
                role: 'CLIENT', walletBalance: 0, isActive: true
            }
        });

        const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });
        const subCat = await prisma.category.findFirst({ where: { parentId: { not: null } } });

        if (!vendor || !subCat) throw new Error('Simulation prerequisites missing');

        console.log(`✅ Family Setup: ${father.fullName} (Banker) & ${daughter.fullName} (Requestor)`);

        // --- STEP 1: Daughter creates the request ---
        console.log(`\n➡️ Step 1: Daughter initiates a request...`);
        const req = await createRequest(daughter.id, {
            title: 'Fix Living Room AC',
            description: 'Needs urgent fix for the family home.',
            categoryId: subCat.id,
            address: 'New Cairo, Family Villa',
            latitude: 30.0444, longitude: 31.2357,
            deliveryPhone: '01012345678'
        });
        console.log(`   [Daughter] Request Created: #${req!.id}`);

        // --- Step 2: Admin Approval ---
        await reviewRequest(req!.id, 'approve');
        console.log(`   [System] Admin Approved Request.`);

        // --- Step 3: Vendor Bids ---
        const bid = await createBid(vendor.id, {
            requestId: req!.id,
            netPrice: 400,
            description: 'I can fix it today with 6 months warranty.'
        });
        console.log(`   [Vendor] Bid Submitted: ${bid.clientPrice} EGP`);

        // --- Step 4: Father reviews & selects the bid (Family Decision) ---
        console.log(`\n➡️ Step 2: Father oversees the decision and pays...`);
        // Simulate forwarding to Father
        await prisma.bid.update({ where: { id: bid.id }, data: { status: 'SELECTED' } });
        await prisma.request.update({ where: { id: req!.id }, data: { status: 'OFFERS_FORWARDED' } });

        // Father accepts the offer for the daughter's request
        await acceptOffer(bid.id, daughter.id); 
        console.log(`   [Father] Verified & Accepted the bid for his daughter.`);

        // --- Step 5: Father PAYS using HIS balance but for DAUGHTER'S request ---
        // Note: Our current service expects 'clientId'. To support Family, 
        // we simulate the Father paying.
        console.log(`   [Father] Executing payment from shared family funds...`);
        const paymentResult = await payRequest(req!.id, father.id); // Father pays!
        
        if (paymentResult) {
            console.log(`✅ Payment Successful! Remaining Father Balance: ${paymentResult.newWalletBalance} EGP`);
        }

        // --- Step 6: Fulfillment & Settlement ---
        await prisma.deliveryTracking.create({ data: { requestId: req!.id, status: 'DELIVERED' } });
        const settlement = await settleOrder(req!.id);
        console.log(`\n🏆 Family Flow Completed! Order settled. Admin Commission: ${settlement.adminCommission} EGP`);

    } catch (error: any) {
        console.error('❌ Family Scenario Failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

runFamilyScenario();
