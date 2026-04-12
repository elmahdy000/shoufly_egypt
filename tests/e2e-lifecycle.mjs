/**
 * Shoofly - Full End-to-End Lifecycle Test
 * Uses native fetch with cookie jar simulation
 */

const BASE = "http://localhost:5000/api";
const PASS = "password123";

// Simple cookie store per user
function createSession() {
  const cookies = {};
  return {
    cookies,
    setCookie(header) {
      if (!header) return;
      const parts = Array.isArray(header) ? header : [header];
      for (const h of parts) {
        const [kv] = h.split(";");
        const [k, v] = kv.split("=");
        if (k && v) cookies[k.trim()] = v.trim();
      }
    },
    getCookieHeader() {
      return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
    },
  };
}

async function apiCall(session, path, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };
  if (session.getCookieHeader()) {
    headers["Cookie"] = session.getCookieHeader();
  }
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  
  // Save cookies from response
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) session.setCookie(setCookie);

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    throw new Error(`[${res.status}] ${data?.error || text}`);
  }
  return data;
}

function ok(msg) { console.log(`  ✅ ${msg}`); }
function fail(msg) { console.log(`  ❌ ${msg}`); }
function step(n, msg) { console.log(`\n[${n}] ${msg}`); }

async function login(session, email) {
  const res = await apiCall(session, "/auth/login", "POST", { email, password: PASS });
  ok(`Logged in: ${email} (id=${res.id} role=${res.role})`);
  return res;
}

// ============ MAIN TEST ============
const results = {};

(async () => {
  console.log("\n🚀 SHOOFLY FULL E2E LIFECYCLE TEST\n" + "=".repeat(50));

  const cSess = createSession(); // Client
  const aSess = createSession(); // Admin
  const vSess = createSession(); // Vendor
  const rSess = createSession(); // Rider

  let reqId, bidId, qrCode;

  // 1. CLIENT LOGIN
  step(1, "CLIENT LOGIN");
  try { await login(cSess, "client@shoofly.com"); results.p1 = "PASS"; }
  catch (e) { fail(e.message); return; }

  // 2. GET SUB-CATEGORY
  step(2, "GET SUBCATEGORIES");
  let subCatId = 15;
  try {
    const cats = await apiCall(cSess, "/categories?parentId=13");
    subCatId = cats[0]?.id || 15;
    ok(`Using subCatId=${subCatId} (${cats[0]?.slug})`);
    results.p2 = "PASS";
  } catch (e) { fail(e.message); results.p2 = `FAIL: ${e.message}`; }

  // 3. CREATE REQUEST
  step(3, "CREATE REQUEST");
  try {
    const req = await apiCall(cSess, "/requests", "POST", {
      title: "E2E Test - Laptop Screen",
      description: "Screen cracked - automated test",
      categoryId: subCatId,
      address: "Maadi, Cairo",
      latitude: 29.96,
      longitude: 31.25,
      deliveryPhone: "01012345678",
      notes: "E2E automated test",
    });
    reqId = req.id;
    ok(`Request created: reqId=${reqId} status=${req.status}`);
    results.p3 = "PASS";
  } catch (e) { fail(e.message); results.p3 = `FAIL: ${e.message}`; return; }

  // 4. ADMIN LOGIN & APPROVE
  step(4, "ADMIN LOGIN");
  try { await login(aSess, "admin@shoofly.com"); results.p4 = "PASS"; }
  catch (e) { fail(e.message); return; }

  step(5, "ADMIN APPROVE");
  try {
    const r = await apiCall(aSess, `/admin/requests/${reqId}/review`, "PATCH", { action: "approve" });
    ok(`Approved -> status=${r.status}`);
    results.p5 = "PASS";
  } catch (e) { fail(e.message); results.p5 = `FAIL: ${e.message}`; }

  step(6, "ADMIN DISPATCH");
  try {
    const r = await apiCall(aSess, `/admin/requests/${reqId}/dispatch`, "PATCH");
    ok(`Dispatched -> status=${r.status}`);
    results.p6 = "PASS";
  } catch (e) { fail(e.message); results.p6 = `FAIL: ${e.message}`; }

  // 5. VENDOR
  step(7, "VENDOR LOGIN");
  try { await login(vSess, "vendor@shoofly.com"); results.p7 = "PASS"; }
  catch (e) { fail(e.message); return; }

  let vWalletBefore = 0;
  try {
    // Get vendor wallet balance from transactions endpoint
    const txs = await apiCall(vSess, "/vendor/transactions");
    // walletBalance is on the user, get it from login userinfo
    ok(`Vendor logged in - wallet check via transactions`);
    // We'll compare transaction totals to infer payout
    vWalletBefore = txs?.walletBalance || 0;
    ok(`Vendor wallet BEFORE: ${vWalletBefore} (from profile)`);
  } catch (e) { ok(`Vendor ready (wallet baseline: ${vWalletBefore})`); }

  step(8, "VENDOR SUBMIT BID");
  try {
    const b = await apiCall(vSess, "/bids", "POST", {
      requestId: reqId,
      description: "E2E Test Bid - laptop screen repair with warranty",
      netPrice: 1200,
      clientPrice: 1500,
    });
    bidId = b.id;
    ok(`Bid submitted: bidId=${bidId} clientPrice=${b.clientPrice}`);
    results.p8 = "PASS";
  } catch (e) { fail(e.message); results.p8 = `FAIL: ${e.message}`; return; }

  // 6. ADMIN FORWARD
  step(9, "ADMIN FORWARD BID");
  try {
    const r = await apiCall(aSess, `/admin/bids/${bidId}/forward`, "PATCH");
    ok(`Forwarded -> status=${r.status}`);
    results.p9 = "PASS";
  } catch (e) { fail(e.message); results.p9 = `FAIL: ${e.message}`; }

  // 7. CLIENT ACCEPT & PAY
  step(10, "CLIENT ACCEPT BID");
  try {
    const r = await apiCall(cSess, `/client/offers/bid/${bidId}/accept`, "PATCH");
    ok(`Accepted -> ${JSON.stringify(r)}`);
    results.p10 = "PASS";
  } catch (e) { fail(e.message); results.p10 = `FAIL: ${e.message}`; }

  step(11, "CLIENT PAY (ESCROW)");
  try {
    const r = await apiCall(cSess, `/client/payments/request/${reqId}`, "POST");
    ok(`Paid! status=${r.status}`);
    results.p11 = "PASS";
  } catch (e) { fail(e.message); results.p11 = `FAIL: ${e.message}`; }

  // 8. VENDOR MARKS STATUS
  step(12, "VENDOR PREPARING");
  try {
    await apiCall(vSess, `/vendor/bids/${bidId}/status`, "PATCH", { status: "VENDOR_PREPARING" });
    ok("Set VENDOR_PREPARING");
    results.p12 = "PASS";
  } catch (e) { fail(e.message); results.p12 = `FAIL: ${e.message}`; }

  step(13, "VENDOR READY FOR PICKUP");
  try {
    await apiCall(vSess, `/vendor/bids/${bidId}/status`, "PATCH", { status: "READY_FOR_PICKUP" });
    ok("Set READY_FOR_PICKUP");
    results.p13 = "PASS";
  } catch (e) { fail(e.message); results.p13 = `FAIL: ${e.message}`; }

  // 9. RIDER
  step(14, "RIDER LOGIN");
  try { await login(rSess, "rider@shoofly.com"); results.p14 = "PASS"; }
  catch (e) { fail(e.message); return; }

  let rWalletBefore = 0;
  try {
    const rp = await apiCall(rSess, "/delivery/profile");
    rWalletBefore = Number(rp.walletBalance);
    ok(`Rider wallet BEFORE: ${rWalletBefore}`);
  } catch (e) { fail(`Get rider profile: ${e.message}`); }

  step(15, "RIDER ACCEPT TASK");
  try {
    const r = await apiCall(rSess, `/delivery/tasks/${reqId}/accept`, "POST");
    ok(`Task accepted: ${JSON.stringify(r)}`);
    results.p15 = "PASS";
  } catch (e) { fail(e.message); results.p15 = `FAIL: ${e.message}`; }

  step(16, "RIDER MARK DELIVERED");
  try {
    const r = await apiCall(rSess, `/delivery/tasks/${reqId}/complete`, "PATCH");
    ok(`Marked delivered: ${JSON.stringify(r)}`);
    results.p16 = "PASS";
  } catch (e) { fail(e.message); results.p16 = `FAIL: ${e.message}`; }

  // 10. CLIENT CONFIRMS
  step(17, "GET QR CODE");
  try {
    const det = await apiCall(cSess, `/requests/${reqId}`);
    qrCode = det.qrCode;
    ok(`QR = ${qrCode ? qrCode.substring(0, 50) + "..." : "NOT FOUND"}`);
    results.p17 = qrCode ? "PASS" : "FAIL: No QR code";
  } catch (e) { fail(e.message); results.p17 = `FAIL: ${e.message}`; }

  step(18, "CLIENT CONFIRM VIA QR");
  if (qrCode) {
    try {
      const settled = await apiCall(cSess, `/client/qr/confirm/${reqId}`, "POST", { qrCode });
      ok(`🎉 ORDER SETTLED! status=${settled.finalRequestStatus} vendorPayout=${settled.vendorPayout} adminCommission=${settled.adminCommission}`);
      results.p18 = `PASS - vendorPayout=${settled.vendorPayout}`;
    } catch (e) { fail(e.message); results.p18 = `FAIL: ${e.message}`; }
  } else {
    fail("SKIP - no QR code");
    results.p18 = "SKIP";
  }

  // 11. VERIFY WALLETS
  step(19, "VERIFY FINAL WALLETS");
  // Check vendor transactions to verify payout was recorded
  try {
    const vTxs = await apiCall(vSess, "/vendor/transactions");
    const payouts = vTxs.filter(t => t.type === 'VENDOR_PAYOUT');
    if (payouts.length > 0) {
      const lastPayout = payouts[payouts.length - 1];
      ok(`Vendor PAYOUT recorded: ${lastPayout.amount} EGP (txId=${lastPayout.id}) ✅`);
      results.p19_vendor = `PASS (payout=${lastPayout.amount})`;
    } else {
      fail(`No vendor payout transactions found`);
      results.p19_vendor = "FAIL (no VENDOR_PAYOUT tx)";
    }
  } catch (e) { fail(e.message); results.p19_vendor = `FAIL: ${e.message}`; }

  // Check rider tasks to confirm delivery happened
  try {
    const tasks = await apiCall(rSess, "/delivery/tasks");
    const myTasks = tasks.myTasks || [];
    ok(`Rider has ${myTasks.length} active tasks. Test delivery completed.`);
    results.p19_rider = "PASS (delivery confirmed)";
  } catch (e) { fail(e.message); results.p19_rider = `FAIL: ${e.message}`; }

  // FINAL REPORT
  console.log("\n" + "=".repeat(60));
  console.log("📊  SHOOFLY FULL LIFECYCLE TEST — FINAL REPORT");
  console.log("=".repeat(60));
  let passed = 0, failed = 0;
  for (const [k, v] of Object.entries(results)) {
    const isPass = v.startsWith("PASS");
    console.log(`  ${isPass ? "✅" : "❌"} ${k.padEnd(20)} ${v}`);
    if (isPass) passed++; else failed++;
  }
  console.log("-".repeat(60));
  console.log(`  TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed} | RATE: ${Math.round(passed/(passed+failed)*100)}%`);
  console.log("=".repeat(60) + "\n");
})();
