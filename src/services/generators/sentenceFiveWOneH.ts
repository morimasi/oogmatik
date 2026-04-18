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
    - ${count} adet benzersiz cümle üret.
    - Yaş grubu: ${ageGroup}
    - Zorluk seviyesi: ${difficulty}
    - Her cümle için en az 2, en fazla 4 adet 5N1K sorusu ve cevabı ekle.
    - Soru tipleri: 'who' (Kim?), 'what' (Ne?), 'where' (Nerede?), 'when' (Ne zaman?), 'how' (Nasıl?), 'why' (Niçin?).

    KURALLAR:
    - Cümleler disleksi dostu olmalı (karışık eklerden mümkün olduğunca kaçın, net bir yapı kur).
    - Cevaplar cümleden doğrudan çıkarılabilmeli.
    - Cevaplar kısa ve öz olmalı.
    - Tanı koyucu dil kullanma.
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
            { "type": "who", "question": "Kim?", "answer": "Cevap" },
            { "type": "where", "question": "Nerede?", "answer": "Cevap" }
          ]
        }
      ],
      "pedagogicalNote": "Öğretmen için pedagojik açıklama (neden bu cümleler seçildi?)"
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
