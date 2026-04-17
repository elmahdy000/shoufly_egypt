import { prisma } from '../../prisma';
import { logger } from '../../utils/logger';

export interface AuditResult {
  isSpam: boolean;
  score: number; // 0-100 (100 is definitely spam)
  suggestedCategory: string;
  isHarmful: boolean;
  reasoning: string;
  recommendedAction: 'APPROVE' | 'REJECT' | 'ADMIN_REVIEW';
}

/**
 * 🧠 The Watchtower: Intelligent AI Request Auditor
 * This service analyzes new requests using Gemini 1.5 Flash logic.
 */
export async function auditRequest(title: string, description: string): Promise<AuditResult> {
  logger.info('ai.audit.started', { title });

  // In a real scenario, we call Google Generative AI here.
  // For this simulation, we implement the "Intelligence Logic" to show the impact.
  
  const content = `${title} ${description}`.toLowerCase();
  
  // Real-world heuristics simulated as AI patterns
  const spamKeywords = ['ربح سريع', 'دولارات مجانا', 'كاش باهر', 'اضغط هنا', 'fake', 'test test'];
  const harmfulKeywords = ['سلاح', 'مخدرات', 'شتيمة', 'bomb', 'drugs'];

  const foundSpam = spamKeywords.filter(k => content.includes(k));
  const foundHarmful = harmfulKeywords.filter(k => content.includes(k));

  // Simulated AI Logic
  let result: AuditResult = {
    isSpam: foundSpam.length > 0,
    score: foundSpam.length * 25,
    suggestedCategory: 'Needs Analysis',
    isHarmful: foundHarmful.length > 0,
    reasoning: 'محتوى طبيعي ولا يوجد مخالفات.',
    recommendedAction: 'APPROVE'
  };

  if (result.isHarmful) {
    result.reasoning = `🚨 تم اكتشاف محتوى مخالف: [${foundHarmful.join(', ')}]`;
    result.recommendedAction = 'REJECT';
  } else if (result.isSpam) {
    result.reasoning = `⚠️ اشتباه في محتوى ترويجي أو غير لائق: [${foundSpam.join(', ')}]`;
    result.recommendedAction = 'ADMIN_REVIEW';
    result.score = Math.min(result.score, 100);
  } else if (content.length < 10) {
    result.reasoning = 'المحتوى قصير جداً وغير واضح.';
    result.recommendedAction = 'ADMIN_REVIEW';
    result.score = 40;
  }

  // AI-Powered Automatic Categorization (Simplified Simulation)
  if (content.includes('ايفون') || content.includes('موبايل') || content.includes('لاب توب') || content.includes('سيرفرات')) {
    result.suggestedCategory = 'إلكترونيات وأجهزة كمبيوتر';
  } else if (content.includes('ميكانيكي') || content.includes('عفشة') || content.includes('سيارة')) {
    result.suggestedCategory = 'خدمات سيارات';
  } else if (content.includes('اكل') || content.includes('ميزانية') || content.includes('وجبة')) {
    result.suggestedCategory = 'تجهيزات ومأكولات';
  }

  logger.info('ai.audit.completed', { action: result.recommendedAction, score: result.score });
  
  return result;
}

/**
 * Integration helper: Automatically flags the request in DB based on AI audit
 */
export async function processAiAudit(requestId: number) {
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return;

    const audit = await auditRequest(request.title, request.description);
    const { createNotification } = await import('../notifications/create-notification');

    // If AI rejects it, we move it to REJECTED status immediately
    if (audit.recommendedAction === 'REJECT') {
        await prisma.request.update({
            where: { id: requestId },
            data: { status: 'REJECTED', notes: `رفض آلي (AI): ${audit.reasoning}` }
        });

        await createNotification({
            userId: request.clientId,
            type: 'REQUEST_REJECTED' as any,
            title: 'تم رفض طلبك',
            message: `عذراً، تم رفض طلبك "${request.title}" بسبب: ${audit.reasoning}`,
            requestId: request.id
        });

    } else if (audit.recommendedAction === 'ADMIN_REVIEW') {
        await prisma.request.update({
            where: { id: requestId },
            data: { status: 'PENDING_ADMIN_REVISION', notes: `مراجعة مطلوبة (AI): ${audit.reasoning}` }
        });

        await createNotification({
            userId: request.clientId,
            type: 'REQUEST_NEEDS_REVISION' as any,
            title: 'طلبك قيد المراجعة',
            message: `طلبك "${request.title}" يحتاج مراجعة من الإدارة: ${audit.reasoning}`,
            requestId: request.id
        });

    } else {
        // AI approves - automatically open for bidding! (Massive speed up)
        await prisma.request.update({
            where: { id: requestId },
            data: { status: 'OPEN_FOR_BIDDING', notes: 'موافقة آلية فورية (AI)' }
        });

        await createNotification({
            userId: request.clientId,
            type: 'OFFER_RECEIVED' as any, // Or a generic type
            title: 'بدأ استقبال العروض',
            message: `تمت الموافقة على طلبك "${request.title}" وهو الآن متاح للموردين لت تقديم عروضهم.`,
            requestId: request.id
        });
    }

    return audit;
}
