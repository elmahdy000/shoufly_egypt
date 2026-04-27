import { auditRequest } from '../lib/services/ai/audit-request';
import { scoreBid } from '../lib/services/ai/score-bid';
import { getSupportResponse } from '../lib/services/ai/support-bot';
import 'dotenv/config';

async function testGeminiIntegration() {
  console.log('🤖 STARTING GEMINI AI INTEGRATION TEST 🤖\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'REPLACE_WITH_YOUR_GEMINI_API_KEY') {
    console.warn('⚠️  No API Key found. This test will run in FALLBACK mode.');
  }

  // 1. Test Audit
  console.log('--- 🛡️ Testing Request Audit ---');
  const audit = await auditRequest('تصليح غسالة سامسونج', 'الغسالة بتنزل مية ومحتاج فني ضروري في التجمع');
  console.log('AI Reasoning:', audit.reasoning);
  console.log('Suggested Category:', audit.suggestedCategory);
  console.log('Action:', audit.recommendedAction);

  // 2. Test Support
  console.log('\n--- 💬 Testing Support Bot ---');
  const support = await getSupportResponse('أنا عايز أشحن محفظتي أعمل إيه؟');
  console.log('AI Answer:', support.answer);
  console.log('Suggestions:', support.suggestions.join(' | '));

  console.log('\n✨ GEMINI INTEGRATION TEST COMPLETED ✨');
}

testGeminiIntegration().catch(console.error);
