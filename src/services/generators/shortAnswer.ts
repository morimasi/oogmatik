import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';

export const generateShortAnswerFromAI = async (
  options: GeneratorOptions
): Promise<any> => {
  const opts = options as unknown as Record<string, unknown>;
  const topic = (opts.topic as string) || 'Genel Kültür';
  const difficulty = options.difficulty || 'Orta';
  const count = (opts.itemCountShort as number) || 8;

  const prompt = `
Uzman: Eğitim Teknoloğu & Soru Hazırlama Uzmanı
Görev: "${topic}" temalı, "${difficulty}" zorluk seviyesinde ${count} adet kısa cevaplı (açık uçlu) soru üret.

KURAL 1: Veri Yapısı (JSON)
{
  "id": "sa_ai_v2",
  "activityType": "SHORT_ANSWER",
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

  return parsedData;
};
