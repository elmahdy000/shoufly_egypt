import { auditRequest, processAiAudit } from '../lib/services/ai/audit-request';
import { prisma } from '../lib/prisma';

async function runAiIntelligenceAudit() {
  console.log('🤖 --- STARTING THE GEMINI INTELLIGENCE AUDIT SIMULATION --- 🤖');
  console.log('Testing automated moderation, spam detection, and categorization...\n');

  const testCases = [
    { 
        title: 'عفشة العربية بايظة', 
        desc: 'يا ريس محتاج ميكانيكي شاطر يظبطلي العفشة ويغير المساعدين في أسرع وقت.',
        expected: 'APPROVE'
    },
    { 
        title: 'فرصة عمل من البيت!!', 
        desc: 'اشتغل ساعة واحدة واكسب 1000 جنيه كاش باهر مجاناً مش نصب والله.',
        expected: 'ADMIN_REVIEW / REJECT'
    },
    { 
        title: 'خبير ذكاء اصطناعي', 
        desc: 'محتاج مبرمج متخصص في ربط السيرفرات بقاعدة بيانات فيكتور سيرش.',
        expected: 'APPROVE'
    },
    { 
        title: 'مطلوب مخدرات', 
        desc: 'محتاج كمية مخدرات للتوصيل الفوري.',
        expected: 'REJECT'
    }
  ];

  try {
    const client = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
    const cat = await prisma.category.findFirst({ where: { parentId: { not: null } } });

    if (!client || !cat) throw new Error('Setup missing users/categories.');

    for (const test of testCases) {
        console.log(`\n📝 SUBMITTING REQUEST: [${test.title}]`);
        
        // 1. Create the request in DB
        const req = await prisma.request.create({
            data: {
                clientId: client.id, categoryId: cat.id, 
                title: test.title, description: test.desc,
                address: 'Simulation City', latitude: 0, longitude: 0, deliveryPhone: '000',
                status: 'PENDING_ADMIN_REVISION' // Starts at revision
            }
        });

        // 2. Trigger the AI Audit
        console.log('🧠 AI Audit in progress...');
        const auditResult = await processAiAudit(req.id);

        // 3. Check final status
        const updatedReq = await prisma.request.findUnique({ where: { id: req.id } });
        
        console.log(`🛡️ AI REASONING: ${auditResult?.reasoning}`);
        console.log(`🏷️ SUGGESTED CATEGORY: ${auditResult?.suggestedCategory}`);
        console.log(`🏁 FINAL STATUS: ${updatedReq?.status}`);
        
        if (updatedReq?.status === 'OPEN_FOR_BIDDING') {
            console.log('⭐ RESULT: SEAMLESS AUTO-APPROVAL (Fastest Market Response)');
        } else if (updatedReq?.status === 'REJECTED') {
            console.log('🚩 RESULT: AUTOMATIC REJECTION (System Protection High)');
        } else {
            console.log('🔍 RESULT: FLAGGED FOR HUMAN MODERATOR');
        }
    }

    console.log('\n✅ AI INTELLIGENCE SIMULATION COMPLETE: The platform is now self-moderated.');

  } catch (err: any) {
    console.error('❌ AI SIMULATION ERROR:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

runAiIntelligenceAudit();
