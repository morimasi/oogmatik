import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { Sentence5W1HData, Sentence5W1HItem } from '../../types/verbal';
import { AppError } from '../../utils/AppError';

/**
 * Cümlede 5N1K etkinliği için AI tabanlı içerik üreticisi.
 * Ultra profesyonel ve pedagojik standartlara uygun cümleler üretir.
 */
export const generateSentenceFiveWOneHFromAI = async (
  options: GeneratorOptions
): Promise<Sentence5W1HData> => {
  const { count = 10, difficulty = 'orta', ageGroup = '8-10' } = options;

  const prompt = `
    Sen bir özel eğitim uzmanısın (disleksi ve DEHB odaklı). 
    Türkçe dil bilgisi kurallarına uygun, pedagojik değeri yüksek, ilgi çekici ve öğretici "Cümlede 5N1K" soruları üretmeni istiyorum.

    GÖREV:
    - ${count} adet benzersiz ve detaylı cümle üret.
    - Yaş grubu: ${ageGroup}
    - Zorluk seviyesi: ${difficulty}
    - Önemli: Her cümle MUTLAKA şu 6 öğeyi de barındırmalıdır: Kim, Ne, Nerede, Ne Zaman, Nasıl, Niçin.
    - Her cümle için 6 adet 5N1K sorusu ve cevabı ekle.

    KURALLAR:
    - Cümleler tüm 5N1K öğelerine cevap verecek kadar zengin olmalı (Örn: "Ali, dün akşam okulda karnı acıktığı için sepetinden sessizce elmasını aldı.")
    - Soru tipleri: 'who', 'what', 'where', 'when', 'how', 'why' anahtarlarını kullan.
    - Cümleler disleksi dostu olmalı (net yapı, karmaşık tamlamalardan kaçın).
    - Cevaplar kısa ve öz olmalı.
    - MUTLAKA aşağıdaki JSON yapısında döndür.

    ÇIKTI FORMATI (JSON):
    {
      "items": [
        {
          "id": "ai1",
          "sentence": "Cümle metni buraya",
          "difficulty": "${difficulty}",
          "ageGroup": "${ageGroup}",
          "questions": [
            { "type": "who", "question": "Kim?", "answer": "..." },
            { "type": "what", "question": "Ne?", "answer": "..." },
            { "type": "where", "question": "Nerede?", "answer": "..." },
            { "type": "when", "question": "Ne zaman?", "answer": "..." },
            { "type": "how", "question": "Nasıl?", "answer": "..." },
            { "type": "why", "question": "Niçin?", "answer": "..." }
          ]
        }
      ],
      "pedagogicalNote": "Öğretmen için pedagojik açıklama"
    }
  `;

  try {
    const result = await generateCreativeMultimodal({ prompt });
    
    if (!result || !result.items) {
      throw new AppError('AI içeriği üretilemedi.', 'GENERATION_FAILED', 500);
    }

    return {
      type: 'SENTENCE_5W1H',
      title: 'Cümlede 5N1K Çalışması',
      instruction: 'Aşağıdaki cümleleri okuyunuz ve ilgili 5N1K sorularını cevaplayınız.',
      items: result.items as Sentence5W1HItem[],
      pedagogicalNote: result.pedagogicalNote || 'Bu aktivite, öğrencinin okuduğunu anlama ve temel dil bilgisi yapılarını (5N1K) analiz etme becerilerini geliştirir.',
      metadata: {
        difficulty,
        ageGroup,
        generatedAt: new Date().toISOString(),
        isAiGenerated: true
      }
    };
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      'Cümlede 5N1K içeriği üretilirken bir hata oluştu.',
      'AI_GENERATOR_ERROR',
      500,
      { originalError: error?.message || String(error) }
    );
  }
};
