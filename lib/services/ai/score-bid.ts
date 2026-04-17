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
    Vendor Rating: ${bid.vendor.walletBalance > 1000 ? 'Premier' : 'Standard'}
  `.toLowerCase();

  // Simulated Professionality Analysis
  let score = 50; // Base score
  let analysis = 'Standard offer detected.';

  // 1. Context Matching
  if (bid.description.length > 50) score += 10;
  if (bid.description.includes('ضمان') || bid.description.includes('اصلي') || bid.description.includes('فورا')) {
    score += 15;
    analysis = 'High trust keywords detected in offer.';
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
    const scoreResult = await scoreBid(0, bidId); // requestId unused in mock
    
    await prisma.bid.update({
        where: { id: bidId },
        data: {
            adminNote: `AI Rank: ${scoreResult.recommendation} (${scoreResult.score}/100) - ${scoreResult.analysis}`
        }
    });
    
    return scoreResult;
}
