import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { createReview } from '@/lib/services/reviews/create-review';
import { z } from 'zod';

const reviewSchema = z.object({
  requestId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const body = await req.json();
    const data = reviewSchema.parse(body);

    const review = await createReview({
      ...data,
      reviewerId: user.id,
    });

    return NextResponse.json(review);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
