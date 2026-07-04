import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';

export const generateEsAnlamliKelimelerFromAI = async (
  options: GeneratorOptions
): Promise<any> => {
  const opts = options as unknown as Record<string, unknown>;
  const topic = (opts.topic as string) || 'Genel Türkçe';
  const difficulty = options.difficulty || 'Orta';
  const wordCount = (opts.wordCount as number) || 6;

  const prompt = `
Görev: "${topic}" temalı, disleksi dostu bir "Eş Anlamlı Kelimeler" etkinliği üret.

VERİ YAPISI (JSON):
{
  "activityType": "ES_ANLAMLI_KELIMELER",
  "title": "${topic} - Anlam Yolculuğu",
  "instruction": "Her kelimenin eş anlamlılarını incele ve cümleyi tamamla.",
  "settings": {
    "layout": "card_grid",
    "wordCount": ${wordCount},
    "includeAntonyms": true,
    "includeExamples": true,
    "includeEtymology": false,
    "topic": "${topic}"
  },
  "items": [
    {
      "id": "eak_1",
      "sourceWord": "örnek_kelime",
      "synonyms": ["anlamdaş1", "anlamdaş2"],
      "antonym": "zıt_anlam",
      "exampleSentence": "Cümle _______ ile tamamlanır.",
      "correctAnswer": "doğru_cevap",
      "emoji": "🌸",
      "etymologyNote": "Köken bilgisi (opsiyonel)",
      "usageContext": "Resmi | Günlük | Edebi"
    }
  ]
}

ZORLUK: ${difficulty}
- ${difficulty === 'Zor' ? 'Akademik ve edebi kelimeler seç.' : 'Basit ve günlük kelimeler seç.'}
- Tam ${wordCount} adet item üret.
- Her item'in sourceWord benzersiz olsun.
- exampleSentence içinde doğru cevabın yerine _______(6 alt çizgi) koy.
- usageContext: "Resmi", "Günlük" veya "Edebi" değerlerinden birini kullan.
- emoji: kelimeyle ilgili bir emoji seç.
- etymologyNote: sadece ilginç bir köken varsa ekle, yoksa boş string bırak.

ZORUNLU: Sadece JSON döndür.
  `;

  const parsedData = await generateCreativeMultimodal({
    prompt: prompt,
    temperature: 0.4,
  });

  return parsedData;
};
