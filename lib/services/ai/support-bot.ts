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

export async function getSupportResponse(query: string): Promise<SupportResponse> {
  logger.info('ai.support_bot.queried', { query });

  const input = query.toLowerCase();
  
  // 1. Semantic Search Logic
  const match = KNOWLEDGE_BASE.find(k => 
    k.keywords.some(word => input.includes(word))
  );

  if (match) {
    return {
      answer: match.answer,
      suggestions: match.suggestions
    };
  }

  // 2. Generic AI Response
  return {
    answer: 'أهلاً بك في دعم "شوفلي مصر". حالياً، لم أستطع العثور على إجابة محددة لاستفسارك، ولكن يمكنك محاولة البحث بكلمات مثل (الدفع، التسجيل، المشاكل) أو الضغط على "التحدث لموظف" لمساعدتك بشكل أفضل.',
    suggestions: ['كيف يعمل التطبيق؟', 'الأسعار والعمولات', 'تحدث لموظف']
  };
}
