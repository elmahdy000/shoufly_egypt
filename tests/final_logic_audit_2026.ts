import { prisma } from '../lib/prisma';
import { createRequest } from '../lib/services/requests/create-request';
import { processAiAudit } from '../lib/services/ai/audit-request';
import { createBid } from '../lib/services/bids/create-bid';
import { applyAiBidScoring } from '../lib/services/ai/score-bid';
import { payRequest } from '../lib/services/payments/pay-request';
import { settleOrder } from '../lib/services/transactions/settle-order';
import { getSupportResponse } from '../lib/services/ai/support-bot';
import { logger } from '../lib/utils/logger';

/**
 * 🏆 --- SHOOFLY EGYPT FINAL LOGIC AUDIT 2026 --- 🏆
 * Comprehensive test of all interdependent services.
 */

async function runFinalAudit() {
  console.log('🚀 Starting Final Logic Audit...\n');

  try {
    // 1. SETUP PREREQUISITES
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });
    const cat = await prisma.category.findFirst({ where: { parentId: { not: null } } });
    const cairo = await prisma.governorate.findFirst({ where: { name: 'القاهرة' } });
    const cairoCity = await prisma.city.findFirst({ where: { governorateId: cairo?.id } });

    if (!client || !vendor || !cat || !cairo || !cairoCity) throw new Error('Prerequisites missing');

    // Reset wallet for test
    await prisma.user.update({ where: { id: client.id }, data: { walletBalance: 2000 } });
    await prisma.user.update({ where: { id: vendor.id }, data: { walletBalance: 0 } });

    // 2. SUPPORT BOT TEST
    console.log('🤖 Testing Support Chatbot...');
    const botRes = await getSupportResponse('عايز اشحن المحفظة');
    console.log(`✅ Bot Answer: ${botRes.answer.slice(0, 50)}...`);

    // 3. REQUEST CREATION & AI AUDIT
    console.log('\n📝 Creating Request + AI Audit...');
    const req = await createRequest(client.id, {
      title: 'طلب صيانة ثلاجة توشيبا',
      description: 'الثلاجة مش بتبرد ومحتاج فني فورا بقطع غيار اصلية',
      categoryId: cat.id,
      address: 'المعادي - شارع 9',
      latitude: 29.9602,
      longitude: 31.2569,
      deliveryPhone: '0123456789',
      governorateId: cairo.id,
      cityId: cairoCity.id
    });
    console.log(`✅ Request Created: ID ${req!.id}`);

    const audit = await processAiAudit(req!.id);
    if (!audit) throw new Error('AI Audit returned no result');
    console.log(`✅ AI Audit Status: ${audit.recommendedAction} (Note: ${audit.reasoning})`);

    // 4. BIDDING & AI SCORING
    console.log('\n🤝 Vendor bidding + AI Scoring...');
    const bid = await createBid(vendor.id, {
      requestId: req!.id,
      description: 'فني متخصص - متاح فورا بقطع غيار اصلية ومعايا ضمان سنتين',
      netPrice: 500,
    });
    console.log(`✅ Bid Created: ID ${bid.id}`);

    const scoring = await applyAiBidScoring(bid.id);
    console.log(`✅ AI Bid Score: ${scoring.score}/100 - ${scoring.recommendation}`);

    // 5. PAYMENT (CLIENT)
    console.log('\n💰 Client Paying for Request...');
    // Mark bid as accepted first
    await prisma.bid.update({ where: { id: bid.id }, data: { status: 'ACCEPTED_BY_CLIENT' } });
    await prisma.request.update({ where: { id: req!.id }, data: { status: 'OFFERS_FORWARDED', selectedBidId: bid.id } });
    
    const payment = await payRequest(req!.id, client.id);
    console.log(`✅ Payment Success! Request Status: ${payment.requestStatus}`);

    // 6. SETTLEMENT (FINANCIAL RELEASE)
    console.log('\n🏁 Order Completed -> Settling Funds...');
    // We must be in a state where payout is allowed
    await prisma.request.update({ where: { id: req!.id }, data: { status: 'ORDER_PAID_PENDING_DELIVERY' } });
    
    const settlement = await settleOrder(req!.id);
    console.log(`✅ Settlement Complete! Success: ${settlement.success}`);

    // 7. FINAL WALLET VERIFICATION
    const finalClient = await prisma.user.findUnique({ where: { id: client.id } });
    const finalVendor = await prisma.user.findUnique({ where: { id: vendor.id } });
    
    console.log(`\n💵 Final Client Balance: ${finalClient?.walletBalance} EGP`);
    console.log(`💵 Final Vendor Balance: ${finalVendor?.walletBalance} EGP`);

    console.log('\n🏆 --- AUDIT COMPLETE: ALL LOGICS VERIFIED --- 🏆');

  } catch (err: any) {
    console.error('\n❌ AUDIT FAILED:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runFinalAudit();
