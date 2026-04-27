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
import { callGemini } from './gemini';

export async function auditRequest(title: string, description: string): Promise<AuditResult> {
  logger.info('ai.audit.started', { title });

  const systemInstruction = `
    You are an expert content moderator for "شوفلي مصر" (Shoofly Egypt), a services marketplace.
    Your task is to analyze service requests and return a JSON response.
    
    Rules:
    1. isSpam: true if it contains promotional links, repetitive gibberish, or fake testing text.
    2. isHarmful: true if it requests illegal services (drugs, weapons), violence, or hate speech.
    3. recommendedAction: 
       - 'REJECT' if isHarmful is true.
       - 'ADMIN_REVIEW' if isSpam is true or content is very ambiguous.
       - 'APPROVE' if it is a legitimate service request (plumbing, car repair, electronics, etc.).
    4. suggestedCategory: Suggest the most relevant category in Arabic (e.g., 'سباكة', 'صيانة سيارات').
    5. reasoning: A brief explanation in Egyptian Arabic.

    Return only JSON in this format:
    {
      "isSpam": boolean,
      "score": number (0-100),
      "suggestedCategory": string,
      "isHarmful": boolean,
      "reasoning": string,
      "recommendedAction": "APPROVE" | "REJECT" | "ADMIN_REVIEW"
    }
  `;

  const prompt = `Request Title: ${title}\nDescription: ${description}`;

  try {
    const rawResponse = await callGemini(prompt, systemInstruction);
    const result: AuditResult = JSON.parse(rawResponse);

    logger.info('ai.audit.completed', { action: result.recommendedAction, score: result.score });
    return result;
  } catch (error: any) {
    logger.error('ai.audit.fallback', { error: error.message });
    
    // Fallback to basic logic if AI fails or key is missing
    const content = `${title} ${description}`.toLowerCase();
    return {
      isSpam: content.includes('ربح') || content.includes('كاش'),
      score: 50,
      suggestedCategory: 'Needs Analysis',
      isHarmful: false,
      reasoning: 'تم استخدام منطق المحاكاة (Fallback) لعدم توفر رد من الذكاء الاصطناعي.',
      recommendedAction: 'ADMIN_REVIEW'
    };
  }
}

/**
 * Integration helper: Automatically flags the request in DB based on AI audit
 */
export async function processAiAudit(requestId: number) {
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request || request.status !== 'PENDING_ADMIN_REVISION') {
        logger.info('ai.audit.skipped', { requestId, currentStatus: request?.status });
        return;
    }

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

        // 🚀 NEW: Automatically notify relevant vendors
        try {
            const { dispatchRequest } = await import('../admin/dispatch-request');
            await dispatchRequest(requestId);
        } catch (e) {
            logger.error('ai.audit.dispatch_failed', { requestId, error: e });
        }

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
