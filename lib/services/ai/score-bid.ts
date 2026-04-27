import { prisma } from '../../prisma';
import { logger } from '../../utils/logger';

export interface BidScoreResult {
  score: number; // 0-100
  recommendation: 'TOP_PICK' | 'SOLID_CHOICE' | 'AVERAGE' | 'RISKY';
  analysis: string;
}

/**
 * 🎯 The Matchmaker: AI Bid Quality Scorer
 * Ranks vendor bids based on professionality, context, and client needs.
 */
import { callGemini } from './gemini';

export async function scoreBid(requestId: number, bidId: number): Promise<BidScoreResult> {
  logger.info('ai.bid_score.started', { requestId, bidId });

  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { vendor: true, request: true }
  });

  if (!bid) throw new Error('Bid not found');

  const systemInstruction = `
    You are an AI Commerce Analyst for "شوفلي مصر" (Shoofly Egypt).
    Your goal is to compare a Vendor's Bid against a Client's Request and score it.
    
    Factors to consider:
    1. Relevance: Does the vendor offer what the client requested?
    2. Professionalism: Is the description clear and detailed?
    3. Trust: Does the offer include quality guarantees (e.g., "ضمان", "أصلي")?
    4. Delivery: Does the vendor mention immediate availability (e.g., "فوراً", "خلال ساعة")?
    5. Price Value: Does the price seem reasonable for the service?

    Return only JSON in this format:
    {
      "score": number (0-100),
      "recommendation": "TOP_PICK" | "SOLID_CHOICE" | "AVERAGE" | "RISKY",
      "analysis": "A one-sentence analysis in Egyptian Arabic summarizing why this score was given."
    }
  `;

  const prompt = `
    CLIENT REQUEST:
    Title: ${bid.request.title}
    Description: ${bid.request.description}

    VENDOR BID:
    Description: ${bid.description}
    Price: ${bid.clientPrice} EGP
    Vendor Verified: ${bid.vendor.isVerified}
  `;

  try {
    const rawResponse = await callGemini(prompt, systemInstruction);
    const result: BidScoreResult = JSON.parse(rawResponse);

    logger.info('ai.bid_score.completed', { bidId, score: result.score, recommendation: result.recommendation });
    return result;
  } catch (error: any) {
    logger.error('ai.bid_score.fallback', { error: error.message });
    
    // Fallback logic
    return {
      score: 60,
      recommendation: 'AVERAGE',
      analysis: 'تم تطبيق تقييم افتراضي نظراً لعدم توفر تحليل الذكاء الاصطناعي اللحظي.'
    };
  }
}

/**
 * Updates the bid with AI feedback for the Client to see
 */
export async function applyAiBidScoring(bidId: number) {
    try {
        const scoreResult = await scoreBid(0, bidId); // requestId unused in mock
        
        await prisma.bid.update({
            where: { id: bidId },
            data: {
                adminNote: `تقييم AI: ${scoreResult.recommendation === 'TOP_PICK' ? 'أفضل اختيار' : scoreResult.recommendation === 'SOLID_CHOICE' ? 'خيار ممتاز' : scoreResult.recommendation === 'RISKY' ? 'يحتاج تدقيق' : 'عرض مقبول'} (${scoreResult.score}/100) - ${scoreResult.analysis}`
            }
        });
        
        return scoreResult;
    } catch (error: any) {
        logger.error('ai.bid_scoring.failed', { bidId, error: error.message });
        // Return a neutral result instead of crashing the process
        return { score: 50, recommendation: 'AVERAGE', analysis: 'التقييم التلقائي غير متاح حالياً.' };
    }
}
