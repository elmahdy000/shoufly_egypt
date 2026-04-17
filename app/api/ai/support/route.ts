import { NextResponse } from 'next/server';
import { getSupportResponse } from '@/lib/services/ai/support-bot';
import { logger } from '@/lib/utils/logger';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = await getSupportResponse(message);

    return NextResponse.json(response);
  } catch (error: any) {
    logger.error('api.ai.support.error', { error: error.message });
    return NextResponse.json(
      { answer: 'عذراً، حدث خطأ تقني في معالجة طلبك. يرجى المحاولة لاحقاً.', suggestions: [] },
      { status: 500 }
    );
  }
}
