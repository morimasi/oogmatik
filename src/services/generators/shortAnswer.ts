import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { AppError } from '../../utils/AppError';

export const generateShortAnswerFromAI = async (
  options: GeneratorOptions
): Promise<any> => {
  const opts = options as unknown as Record<string, unknown>;
  const topic = (opts.topic as string) || 'Genel Kültür';
  const difficulty = options.difficulty || 'Orta';
  const count = (opts.itemCount as number) || (opts.itemCountShort as number) || 8;
  const activityType = (opts.activityType as string) || 'SHORT_ANSWER';

  const prompt = `
Uzman: Eğitim Teknoloğu & Soru Hazırlama Uzmanı
Görev: "${topic}" temalı, "${difficulty}" zorluk seviyesinde ${count} adet kısa cevaplı (açık uçlu) soru üret.

KURAL 1: Veri Yapısı (JSON)
{
  "id": "sa_ai_v2",
  "activityType": "${activityType}",
  "title": "${topic} - Soru Bankası",
  "instruction": "Soruları dikkatle oku ve kutucuklara cevaplarını yaz.",
  "content": {
    "questions": [
      { "id": "1", "text": "Soru cümlesi?", "answer": "Doğru cevap", "hint": "Küçük bir ipucu", "points": 10 }
    ],
    "insight": {
       "title": "Bunu Biliyor musun?",
       "text": "Soru konusu ile ilgili ilginç bir kısa bilgi."
    }
  }
}

KURAL 2: Pedagojik Kalite
- Sorular net, anlaşılır ve tek bir doğru cevabı olan türden olmalı.
- ${difficulty === 'Zor' ? 'Analitik düşünme gerektiren sorular seç.' : 'Hatırlama ve tanıma düzeyinde sorular seç.'}

ZORUNLU: Sadece JSON döndür.
  `;

  const parsedData = await generateCreativeMultimodal({
    prompt: prompt,
    temperature: 0.6,
  });

  const data = parsedData as unknown as Record<string, unknown>;
  const content = data?.content as Record<string, unknown> | undefined;

  if (!content || !Array.isArray(content.questions) || content.questions.length === 0) {
    throw new AppError('Kısa Cevaplı Sorular AI çıktısı geçersiz (content.questions eksik).', 'GENERATION_FAILED', 500);
  }

  return {
    id: (data.id as string) || `sa_ai_${Date.now()}`,
    activityType: activityType,
    title: (data.title as string) || `${topic} - Soru Bankası`,
    instruction: (data.instruction as string) || 'Soruları dikkatle oku ve kutucuklara cevaplarını yaz.',
    settings: { ...options, topic },
    content: {
      questions: content.questions,
      insight: content.insight || {
        title: 'Bunu Biliyor musun?',
        text: 'Soru konusu ile ilgili ilginç bir kısa bilgi.'
      }
    }
  };
};
