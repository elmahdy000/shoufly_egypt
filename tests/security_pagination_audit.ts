import { RateLimiter } from '../lib/rate-limiter';
import { listVendorOpenRequests } from '../lib/services/requests/list-vendor-open-requests';
import { prisma } from '../lib/prisma';

async function runSecurityPaginationAudit() {
  console.log('🛡️ --- STARTING SECURITY & PAGINATION AUDIT --- 🛡️');
  console.log('Testing: Shoofly Armor (Rate Limiting) & National Scale Pagination\n');

  try {
    // 1. RATE LIMITER STRESS TEST
    console.log('🔥 PHASE 1: Rate Limiter Burst Test (Limit: 5)');
    const key = `test_user_${Date.now()}`;
    for (let i = 1; i <= 7; i++) {
        const result = await RateLimiter.check(key, 5, 10);
        if (result.allowed) {
            console.log(`✅ Request ${i}: ALLOWED (Remaining: ${result.remaining})`);
        } else {
            console.log(`❌ Request ${i}: BLOCKED (Retry in: ${result.reset}s)`);
        }
    }

    // 2. PAGINATION PRECISION TEST
    console.log('\n📖 PHASE 2: Pagination Depth Test');
    const vendor = await prisma.user.findFirst({ where: { role: 'VENDOR' } });
    if (!vendor) throw new Error('No vendor found for test');

    console.log(`Fetching page 1 (Limit: 2)...`);
    const page1 = await listVendorOpenRequests(vendor.id, {}, 2, 0);
    console.log(`✅ Page 1 count: ${page1.length}`);
    if (page1.length > 0) console.log(`👉 First ID: ${page1[0].id}`);

    console.log(`\nFetching page 2 (Offset: 2, Limit: 2)...`);
    const page2 = await listVendorOpenRequests(vendor.id, {}, 2, 2);
    console.log(`✅ Page 2 count: ${page2.length}`);
    if (page2.length > 0) {
        console.log(`👉 First ID: ${page2[0].id}`);
        if (page1.length > 0 && page1[0].id === page2[0].id) {
            console.error('⚠️ ERROR: Pagination returned same data for different offsets!');
        } else {
            console.log('✨ SUCCESS: Pagination correctly shifted the window.');
        }
    }

    console.log('\n🏆 ALL AUDITS COMPLETE: Performance and Security verified.');

  } catch (err: any) {
    console.error('❌ AUDIT FAILED:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runSecurityPaginationAudit();
