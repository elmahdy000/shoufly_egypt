import { prisma } from '../lib/prisma';
import { depositFunds } from '../lib/services/transactions/deposit-funds';
import { createRequest } from '../lib/services/requests/create-request';
import { createBid } from '../lib/services/bids/create-bid';
import { acceptOffer } from '../lib/services/offers/accept-offer';
import { payRequest } from '../lib/services/payments/pay-request';

async function runBiddingWarSimulation() {
  console.log('\n⚔️ --- STARTING MULTI-VENDOR BIDDING WAR SIMULATION --- ⚔️\n');

  try {
    // 0. SETUP
    const client = await prisma.user.create({
      data: { fullName: 'W-Client', email: `w_client_${Date.now()}@test.com`, role: 'CLIENT', walletBalance: 0, password: 'password123' }
    });
    const subCat = await prisma.category.findUnique({ where: { slug: 'test-sub' } });
    if (!subCat) throw new Error('Sub-category not found. Run ultimate simulation first.');

    // 1. CREATE REQUEST
    const request = await createRequest(client.id, {
      title: 'Bulk Order Challenge',
      description: 'Who can provide the best price for 100 units?',
      categoryId: subCat.id,
      address: 'Industrial Zone',
      latitude: 0,
      longitude: 0,
      deliveryPhone: '010'
    });
    await prisma.request.update({ where: { id: request.id }, data: { status: 'OPEN_FOR_BIDDING' } });

    // 2. 5 VENDORS BIDDING SIMULTANEOUSLY
    console.log('📢 5 Vendors are placing bids...');
    const vendorIds = await Promise.all([1, 2, 3, 4, 5].map(async (i) => {
        const v = await prisma.user.create({
            data: { fullName: `V-War-${i}`, email: `vwar${i}_${Date.now()}@test.com`, role: 'VENDOR', password: 'password123' }
        });
        return v.id;
    }));

    const bids = await Promise.all(vendorIds.map((vId, i) => 
        createBid(vId, { requestId: request.id, description: `Offer from Vendor ${i+1}`, netPrice: 1000 - (i * 50) })
    ));
    console.log(`✅ 5 Bids received ranging from 800 to 1000 EGP.`);

    // 3. ADMIN SELECTS ALL BIDS (As offers)
    await Promise.all(bids.map(b => prisma.bid.update({ where: { id: b.id }, data: { status: 'SELECTED' } })));
    await prisma.request.update({ where: { id: request.id }, data: { status: 'OFFERS_FORWARDED' } });

    // 4. CLIENT CHOOSES THE BEST ONE (Lowest Price: 800 EGP)
    const bestBid = bids[bids.length - 1];
    console.log(`\n🤝 Client selecting Bid ID: ${bestBid.id} (Price: 800)`);
    await acceptOffer(bestBid.id, client.id);

    // 5. TEST: Trying to PAY with 0 Balance
    console.log('\n💳 TEST: Attempting to PAY with zero balance...');
    const payResult = await payRequest(request.id, client.id);
    if (payResult.insufficientBalance) {
        console.log(`✅ SUCCESS: System detected low balance and returned redirect URL: ${payResult.redirectUrl}`);
    } else {
        console.error('❌ FAIL: System allowed payment with zero balance!');
        process.exit(1);
    }

    // 6. DEPOSIT & PAY
    console.log('\n💰 Depositing 1000 and paying...');
    await depositFunds(client.id, 1000);
    const successPay = await payRequest(request.id, client.id);
    console.log(`✅ Payment Successful. Request Status: ${successPay.requestStatus} | New Balance: ${successPay.newWalletBalance}`);

    console.log('\n🏆 --- BIDDING WAR SIMULATION PASSED --- 🏆\n');

  } catch (err: any) {
    console.error('\n❌ SIMULATION CRASHED!');
    console.error(err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runBiddingWarSimulation();
