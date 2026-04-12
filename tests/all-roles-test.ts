/**
 * Master Test Runner - All User Roles
 * Runs tests for Client, Vendor, Delivery, and Admin logic
 */

import { testClientLogic } from './client-logic-test';
import { testVendorLogic } from './vendor-logic-test';
import { testDeliveryLogic } from './delivery-logic-test';
import { testAdminLogic } from './admin-logic-test';
import 'dotenv/config';

async function runAllRoleTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 COMPREHENSIVE ROLE LOGIC TESTING');
  console.log('='.repeat(60) + '\n');

  const allResults: {
    role: string;
    passed: number;
    failed: number;
    results: { test: string; passed: boolean; error?: string }[];
  }[] = [];

  let totalPassed = 0;
  let totalFailed = 0;

  // Run Client Tests
  try {
    console.log('━'.repeat(60));
    const clientResult = await testClientLogic();
    allResults.push({
      role: 'CLIENT',
      passed: clientResult.passed,
      failed: clientResult.failed,
      results: clientResult.results,
    });
    totalPassed += clientResult.passed;
    totalFailed += clientResult.failed;
  } catch (error: any) {
    console.error('Client tests error:', error.message);
    allResults.push({ role: 'CLIENT', passed: 0, failed: 5, results: [] });
    totalFailed += 5;
  }

  // Run Vendor Tests
  try {
    console.log('\n' + '━'.repeat(60));
    const vendorResult = await testVendorLogic();
    allResults.push({
      role: 'VENDOR',
      passed: vendorResult.passed,
      failed: vendorResult.failed,
      results: vendorResult.results,
    });
    totalPassed += vendorResult.passed;
    totalFailed += vendorResult.failed;
  } catch (error: any) {
    console.error('Vendor tests error:', error.message);
    allResults.push({ role: 'VENDOR', passed: 0, failed: 7, results: [] });
    totalFailed += 7;
  }

  // Run Delivery Tests
  try {
    console.log('\n' + '━'.repeat(60));
    const deliveryResult = await testDeliveryLogic();
    allResults.push({
      role: 'DELIVERY',
      passed: deliveryResult.passed,
      failed: deliveryResult.failed,
      results: deliveryResult.results,
    });
    totalPassed += deliveryResult.passed;
    totalFailed += deliveryResult.failed;
  } catch (error: any) {
    console.error('Delivery tests error:', error.message);
    allResults.push({ role: 'DELIVERY', passed: 0, failed: 7, results: [] });
    totalFailed += 7;
  }

  // Run Admin Tests
  try {
    console.log('\n' + '━'.repeat(60));
    const adminResult = await testAdminLogic();
    allResults.push({
      role: 'ADMIN',
      passed: adminResult.passed,
      failed: adminResult.failed,
      results: adminResult.results,
    });
    totalPassed += adminResult.passed;
    totalFailed += adminResult.failed;
  } catch (error: any) {
    console.error('Admin tests error:', error.message);
    allResults.push({ role: 'ADMIN', passed: 0, failed: 8, results: [] });
    totalFailed += 8;
  }

  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 FINAL TEST SUMMARY');
  console.log('='.repeat(60));

  allResults.forEach(({ role, passed, failed, results }) => {
    const icon = failed === 0 ? '✅' : failed > passed ? '❌' : '⚠️';
    console.log(`\n${icon} ${role}`);
    console.log(`   Passed: ${passed} | Failed: ${failed}`);
    
    if (results.length > 0) {
      const failedTests = results.filter(r => !r.passed);
      if (failedTests.length > 0) {
        console.log('   Failed tests:');
        failedTests.forEach(t => console.log(`     • ${t.test}: ${t.error}`));
      }
    }
  });

  console.log('\n' + '━'.repeat(60));
  console.log(`🎯 OVERALL: ${totalPassed} passed, ${totalFailed} failed`);
  
  if (totalFailed === 0) {
    console.log('✨ All tests passed! System is ready for deployment.');
  } else if (totalFailed < 5) {
    console.log('⚠️ Minor issues detected. Review recommended before deployment.');
  } else {
    console.log('❌ Significant issues detected. Fix before deployment.');
  }
  console.log('='.repeat(60) + '\n');

  return {
    totalPassed,
    totalFailed,
    allResults,
  };
}

// Run if executed directly
if (require.main === module) {
  runAllRoleTests()
    .then(({ totalFailed }) => {
      process.exit(totalFailed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

export { runAllRoleTests };
