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
  const { 
    itemCount = options.count || options.itemCount || 5, 
    difficulty = 'Orta', 
    ageGroup = '8-10', 
    complexity = 'birleşik' 
  } = options;

  const prompt = `
    Sen bir özel eğitim uzmanısın (disleksi ve DEHB odaklı). 
    Türkçe dil bilgisi kurallarına uygun, pedagojik değeri yüksek, ilgi çekici ve öğretici "Cümlede 5N1K" soruları üretmeni istiyorum.

    GÖREV:
    - ${itemCount} adet benzersiz cümle üret.
    - Yaş grubu: ${ageGroup}
    - Zorluk seviyesi: ${difficulty}
    - Cümle Yapısı: ${complexity}
    
    ZORLUK SEVİYESİNE GÖRE KRİTERLER:
    1. Kolay (Basit): Cümle 3-6 kelimeden oluşmalı, tek bir eylem içermeli. 
       Örn: "Ali bugün parkta hızlıca koştu."
    2. Orta (Standart): Cümle 7-12 kelimeden oluşmalı, yan cümlecikler veya bağlaçlar içerebilir.
       Örn: "Küçük kedi akşamleyin mutfakta karnı acıktığı için sütünü içti."
    3. Zor (Karmaşık): Cümle 15+ kelimeden oluşmalı, zengin tasvirler ve birden fazla yan cümlecik içermeli.
    
    KESİN KURALLAR:
    - KURALLI CÜMLE: Tüm cümleler kurallı olmalı! Yüklem/Fiil MUTLAKA cümlenin en sonunda yer almalıdır. Devrik cümle ASLA kurma.
    - 5N1K Uyumu: Her cümle şu 6 öğeye de cevap verecek kadar zengin olmalı: Kim, Ne, Nerede, Ne Zaman, Nasıl, Niçin.
    - DİSLEKSİ DOSTU: Kelimeler net, somut ve okunabilir olmalı.
    - Her cümle için 6 adet 5N1K sorusu ve cevabı ekle.
    - YÜKLEM (PREDICATE): Her cümlenin ana fiilini/yüklemini ayrıca belirt.

    ÇIKTI FORMATI (JSON):
    {
      "items": [
        {
          "id": "ai1",
          "sentence": "Cümle metni buraya (Yüklem sonda!)",
          "predicate": "Yüklem buraya",
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
        isAiGenerated: true,
        showPredicate: options.showPredicate
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
