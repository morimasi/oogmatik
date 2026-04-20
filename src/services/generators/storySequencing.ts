import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { AppError } from '../../utils/AppError';

/**
 * Olay Sıralama (Hikaye) Aktivite Üreticisi
 * Mantıksal ve zamansal sıralama becerilerini geliştirir.
 */
export const generateStorySequencingFromAI = async (options: GeneratorOptions): Promise<any> => {
  const { difficulty = 'orta', ageGroup = '8-10', itemCount = 8 } = options;

  const prompt = `
    Sen bir Özel Eğitim Uzmanısın. Disleksi ve DEHB olan çocuklar için "Olay Sıralama" (Story Sequencing) etkinliği hazırlayacaksın.

    GÖREV:
    1. Kısa ve net bir olay örgüsü olan ${itemCount} adımlık zengin bir hikaye kurgula.
    2. Her adımı detaylı betimlemelerle dolu bir cümleyle açıkla. (A4 SAYFASINI DOLDURACAK YOĞUNLUKTA)
    3. Cümleleri KARIŞIK bir sırada sun, ancak doğru sırayı (order) belirt.

    KURALLAR:
    - Cümleler arası geçişler (Önce, Sonra, Daha Sonra, En Sonunda) belirgin ama öğretici olmalı.
    - Tasarım: Sayfa dopdolu görünmeli, her cümle en az 15-20 kelime olmalı.
    - Yaş grubu: ${ageGroup}, Zorluk: ${difficulty}.
    - Çıktı MUTLAKA aşağıdaki JSON formatında olmalı.

    JSON FORMATI:
    {
      "title": "Olayları Sırala",
      "instruction": "Aşağıdaki karışık verilen olayları doğru sıraya koyunuz.",
      "items": [
        { "id": "s1", "text": "Olay cümlesi 1", "correctOrder": 1 },
        { "id": "s2", "text": "Olay cümlesi 2", "correctOrder": 2 }
      ]
    }
  `;

  try {
    const result = await generateCreativeMultimodal({ prompt });
    
    if (!result || !result.items) {
      throw new AppError('AI Olay Sıralama üretilemedi.', 'GENERATION_FAILED', 500);
    }

    return {
      success: true,
      data: result,
      metadata: { difficulty, ageGroup }
    };
  } catch (error: any) {
    throw new AppError('Olay Sıralama üretilirken hata: ' + error.message, 'AI_ERROR', 500);
  }
};
