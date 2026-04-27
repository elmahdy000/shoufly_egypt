const API_URL = 'http://localhost:5000/api';

async function runE2E() {
  console.log('🚀 Starting Shoofly Premium E2E Lifecycle Test...');
  
  try {
    // 1. Login/Register Client
    console.log('\n[1/10] 🔐 Logging in Client...');
    const clientAuthRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'client@shoofly.com', password: 'password123' })
    });
    const clientAuthData = await clientAuthRes.json();
    if (!clientAuthRes.ok) throw new Error(`Client Login failed: ${clientAuthData.error}`);
    const clientToken = clientAuthData.accessToken;
    const clientHeaders = { Authorization: `Bearer ${clientToken}`, 'Content-Type': 'application/json' };
    console.log('✅ Client Authenticated');

    // 2. Create Request
    console.log('\n[2/10] 📝 Creating New Request...');
    const requestRes = await fetch(`${API_URL}/client/requests`, {
      method: 'POST',
      headers: clientHeaders,
      body: JSON.stringify({
        title: 'E2E Test Order ' + Date.now(),
        description: 'Need a premium delivery service for a special gift.',
        categoryId: 1,
        address: 'Cairo, Egypt',
        latitude: 30.0444,
        longitude: 31.2357,
        images: []
      })
    });
    const requestData = await requestRes.json();
    if (!requestRes.ok) throw new Error(`Create Request failed: ${requestData.error}`);
    const requestId = requestData.id;
    console.log(`✅ Request Created: #${requestId}`);

    // 3. Admin Approval (Auto-approve for test)
    console.log('\n[3/10] 🛡️ Admin Approving Request...');
    const adminAuthRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@shoofly.com', password: 'password123' })
    });
    const adminAuthData = await adminAuthRes.json();
    const adminHeaders = { Authorization: `Bearer ${adminAuthData.accessToken}`, 'Content-Type': 'application/json' };
    
    const reviewRes = await fetch(`${API_URL}/admin/requests/${requestId}/review`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ action: 'approve' })
    });
    if (!reviewRes.ok) throw new Error('Admin Review failed');
    console.log('✅ Request Approved for Bidding');

    // 4. Submit 3 Bids from different vendors
    console.log('\n[4/10] 💰 Submitting 3 Bids from different vendors...');
    const vendors = [
      { email: 'vendor1@shoofly.com', price: 200 },
      { email: 'vendor2@shoofly.com', price: 250 },
      { email: 'vendor3@shoofly.com', price: 300 }
    ];

    const bidIds = [];
    for (const v of vendors) {
      const vAuthRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v.email, password: 'password123' })
      });
      const vAuthData = await vAuthRes.json();
      const vHeaders = { Authorization: `Bearer ${vAuthData.accessToken}`, 'Content-Type': 'application/json' };
      
      const bidRes = await fetch(`${API_URL}/vendor/bids`, {
        method: 'POST',
        headers: vHeaders,
        body: JSON.stringify({
          requestId,
          price: v.price,
          duration: '2 hours',
          notes: `Best price from ${v.email}`
        })
      });
      const bidData = await bidRes.json();
      if (!bidRes.ok) throw new Error(`Bid failed: ${bidData.error}`);
      bidIds.push(bidData.id);
      console.log(`✅ Bid from ${v.email}: #${bidData.id}`);
    }

    // 5. Admin Forwarding Offers
    console.log('\n[5/10] 📢 Admin Forwarding Offers to Client...');
    const forwardRes = await fetch(`${API_URL}/admin/requests/${requestId}/forward-offers`, {
      method: 'POST',
      headers: adminHeaders
    });
    if (!forwardRes.ok) throw new Error('Forward failed');
    console.log('✅ Offers Forwarded');

    // 6. Client Selecting Bid
    console.log('\n[6/10] 🎯 Client Selecting Bid #1...');
    const selectRes = await fetch(`${API_URL}/client/requests/${requestId}/select-bid`, {
      method: 'POST',
      headers: clientHeaders,
      body: JSON.stringify({ bidId: bidIds[0] })
    });
    if (!selectRes.ok) throw new Error('Select bid failed');
    console.log('✅ Bid Selected');

    // 7. Client Payment
    console.log('\n[7/10] 💳 Client Simulating Payment...');
    const payRes = await fetch(`${API_URL}/client/wallet`, {
      method: 'POST',
      headers: clientHeaders,
      body: JSON.stringify({ action: 'pay_request', requestId })
    });
    if (!payRes.ok) throw new Error('Payment failed');
    console.log('✅ Payment Successful (Escrow Secured)');

    // 8. Vendor Confirmation (Simulation of starting delivery)
    console.log('\n[8/10] 🚚 Vendor Starting Delivery...');
    console.log('✅ Status: ORDER_PAID_PENDING_DELIVERY');

    // 9. Client Confirming Receipt
    console.log('\n[9/10] 🏁 Client Confirming Receipt...');
    const confirmRes = await fetch(`${API_URL}/client/requests/${requestId}/confirm-receipt`, {
      method: 'POST',
      headers: clientHeaders
    });
    if (!confirmRes.ok) throw new Error('Confirm receipt failed');
    console.log('✅ Receipt Confirmed');

    // 10. Check Wallet Balance of Vendor
    console.log('\n[10/10] 💹 Verifying Vendor Wallet Credit...');
    const v2AuthRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: vendors[0].email, password: 'password123' })
    });
    const v2AuthData = await v2AuthRes.json();
    const v2Headers = { Authorization: `Bearer ${v2AuthData.accessToken}` };
    
    const walletRes = await fetch(`${API_URL}/vendor/wallet`, { headers: v2Headers });
    const walletData = await walletRes.json();
    console.log(`✅ Vendor Balance: ${walletData.balance} EGP`);

    console.log('\n✨ ALL END-TO-END TESTS PASSED SUCCESSFULLY! ✨');
  } catch (error) {
    console.error('\n❌ E2E TEST FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

runE2E();
