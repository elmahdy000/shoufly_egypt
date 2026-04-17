import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { placeBidSchema } from '@/lib/validations/schemas';
import { createBid } from '@/lib/services/bids';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

/**
 * 📢 Bids API Gateway
 * Fully protected by Zod validation and Role-based access control.
 */

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'VENDOR');

    const body = await req.json();
    
    // 🛡️ Strict Validation
    const validatedData = await placeBidSchema.parseAsync(body);

    const bid = await createBid(user.id, validatedData);
    
    return NextResponse.json(bid, { status: 201 });

  } catch (error: any) {
    logError('BIDS_POST_ERROR', error);
    const { response, status } = createErrorResponse(error);
    return NextResponse.json(response, { status });
  }
}
