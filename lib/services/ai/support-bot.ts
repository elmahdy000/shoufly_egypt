import { logger } from '@/lib/utils/logger';

interface SupportResponse {
  answer: string;
  suggestions: string[];
}

/**
 * 🤖 Shoofly Support Bot Knowledge Base
 * Contains information about the platform's operations, policies, and troubleshooting.
 */
const KNOWLEDGE_BASE = [
  {
    keywords: ['دفع', 'فلوس', 'محفظة', 'شحن', 'payment', 'wallet'],
    answer: 'يمكنك شحن محفظتك عبر تطبيق "سهل" أو عبر التحويل البنكي. يتم حجز قيمة الطلب في "الضمان" حتى تستلم خدمتك وتتأكد من جودتها.',
    suggestions: ['كيف أشحن رصيدي؟', 'متى يعود المبلغ الملغي؟']
  },
  {
    keywords: ['استرداد', 'فلوس راحت فين', 'ترجيح', 'refund', 'money back'],
    answer: 'في حالة إلغاء الطلب قبل قبول العرض أو في حالة وجود مشكلة في التنفيذ، يتم استرداد المبلغ بالكامل إلى محفظتك آلياً وفوراً.',
    suggestions: ['إلغاء طلب', 'التواصل مع الإدارة']
  },
  {
    keywords: ['مورد', 'بايع', 'شغل', 'تسجيل', 'vendor', 'register'],
    answer: 'لتصبح مورداً في "شوفلي"، يجب رفع صورة البطاقة الشخصية وصورة من السجل التجاري أو رخصة مزاولة المهنة. بعد المراجعة سيبدأ استقبال الطلبات.',
    suggestions: ['شروط التوثيق', 'عمولة المنصة']
  },
  {
    keywords: ['توصيل', 'مندوب', 'ريدر', 'delivery', 'rider'],
    answer: 'نحن نوفر خدمة التوصيل للطلبات التي تتطلب ذلك. يتم تتبع المندوب لحظياً عبر الخريطة من واجهة الطلب الخاصة بك.',
    suggestions: ['تتبع المندوب', 'شكوى تأخير']
  },
  {
    keywords: ['مشكلة', 'شكوى', 'نصب', 'بلاغ', 'problem', 'scam'],
    answer: 'أمانك هو أولويتنا. إذا واجهت أي مشكلة، لا تقم بإنهاء الطلب وقم برفع "شكوى" فوراً من لوحة التحكم، وسيتدخل فريق الدعم الفني خلال دقائق.',
    suggestions: ['التحدث لموظف بشري', 'إرسال لقطة شاشة']
  }
];

import { callGemini } from './gemini';

export async function getSupportResponse(query: string): Promise<SupportResponse> {
  logger.info('ai.support_bot.queried', { query });

  const systemInstruction = `
    You are "Shoofly Bot", the AI assistant for "شوفلي مصر" (Shoofly Egypt).
    Your goal is to answer user questions about the platform in a helpful, friendly, and professional manner using Egyptian Arabic.

    Platform Knowledge Base:
    - Payments: Users can top up their wallet via "Sahl" or bank transfer. Funds are held in escrow until the service is completed.
    - Refunds: Automated and immediate if a request is cancelled or if there's a verified issue.
    - Vendors: Need to upload National ID and Commercial Register/License. Admin reviews before activation.
    - Delivery: Real-time tracking is available in the order interface.
    - Security: Use the "Dispute/Complaint" button for issues. Never finish an order until satisfied.

    Response Rules:
    1. Always answer in Egyptian Arabic.
    2. Be concise but helpful.
    3. If you don't know the answer, suggest talking to a human representative.
    4. Provide 2-3 short "suggestions" for follow-up questions.

    Return only JSON:
    {
      "answer": "string",
      "suggestions": ["string", "string"]
    }
  `;

  try {
    const rawResponse = await callGemini(query, systemInstruction);
    const result: SupportResponse = JSON.parse(rawResponse);

    return result;
  } catch (error: any) {
    logger.error('ai.support_bot.fallback', { error: error.message });
    
    // Fallback to static matching
    const input = query.toLowerCase();
    const match = KNOWLEDGE_BASE.find(k => k.keywords.some(word => input.includes(word)));

    if (match) {
      return { answer: match.answer, suggestions: match.suggestions };
    }

    return {
      answer: 'أهلاً بك! حالياً أواجه صعوبة في الاتصال بـ "عقلي الذكي"، لكن يمكنني مساعدتك في الأمور الأساسية مثل الدفع أو التسجيل. كيف أساعدك؟',
      suggestions: ['كيف أشحن رصيدي؟', 'التواصل مع الدعم']
    };
  }
}
