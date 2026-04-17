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
export async function scoreBid(requestId: number, bidId: number): Promise<BidScoreResult> {
  logger.info('ai.bid_score.started', { requestId, bidId });

  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { vendor: true, request: true }
  });

  if (!bid) throw new Error('Bid not found');

  const context = `
    Request: ${bid.request.title} - ${bid.request.description}
    Vendor Offer: ${bid.description}
    Price: ${bid.clientPrice} EGP
    Vendor Rating: ${bid.vendor.walletBalance.gt(1000) ? 'Premier' : 'Standard'}
  `.toLowerCase();

  // Simulated Professionality Analysis
  let score = 50; // Base score
  let analysis = 'Standard offer detected.';

  // 1. Context Matching (Keyword Correlation)
  const reqKeywords = bid.request.title.split(' ').concat(bid.request.description.split(' '));
  const bidKeywords = bid.description.split(' ');
  const intersection = bidKeywords.filter(k => k.length > 2 && reqKeywords.includes(k));
  
  if (intersection.length > 0) {
    score += (intersection.length * 5);
    analysis = `تم اكتشاف تطابق في ${intersection.length} معايير أساسية للطلب.`;
  }

  if (bid.description.includes('ضمان') || bid.description.includes('اصلي') || bid.description.includes('سنتين')) {
    score += 15;
    analysis += ' العرض يتضمن ضمانات جودة إضافية.';
  }

  if (bid.description.includes('فورا') || bid.description.includes('الآن') || bid.description.includes('ساعة')) {
    score += 10;
    analysis += ' المورد مستعد للتنفيذ الفوري.';
  }

  // 2. Price Logic (Simplified)
  // If price is too low vs average might be risky, if too high might be average.
  
  // 3. Vendor Reliability
  if (bid.vendor.isVerified) score += 10;

  // Final Classification
  let recommendation: BidScoreResult['recommendation'] = 'AVERAGE';
  if (score >= 85) recommendation = 'TOP_PICK';
  else if (score >= 70) recommendation = 'SOLID_CHOICE';
  else if (score < 40) recommendation = 'RISKY';

  logger.info('ai.bid_score.completed', { bidId, score, recommendation });

  return { score, recommendation, analysis };
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
        return { score: 50, recommendation: 'AVERAGE', analysis: 'Automatic evaluation currently unavailable.' };
    }
}
