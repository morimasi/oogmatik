import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { AppError } from '../../utils/AppError';

/**
 * Hikaye Analizi (Ultra Pro) Aktivite Üreticisi
 * Derinlemesine anlama, karakter analizi ve olay örgüsü tespiti yapar.
 */
export const generateStoryAnalysisFromAI = async (options: GeneratorOptions): Promise<any> => {
  const { difficulty = 'orta', ageGroup = '8-10', topic = 'Genel Çocuk Hikayesi' } = options;

  const prompt = `
    Sen bir Dil Bilgisi ve Okuma Anlama Uzmanısın (Elif Yıldız rolünde). 
    Disleksi ve DEHB olan çocuklar için "Ultra Pro" seviyesinde bir "Hikaye Analizi" etkinliği üret.

    GÖREV:
    1. Özgün, merak uyandırıcı ve pedagojik değeri olan bir hikaye yaz. 
       - Konu: ${topic}
       - Seviye: ${ageGroup} (${difficulty})
    2. Hikaye için derinlemesine analiz bileşenleri oluştur:
       - Temel 5N1K bilgileri.
       - Karakterlerin özellikleri ve motivasyonları.
       - Olayın geçtiği yer ve zamanın atmosferik detayları.
       - Hikayenin ana fikri ve yardımcı fikirleri.
       - "Giriş-Gelişme-Sonuç" şeması.

    KURALLAR:
    - Dil disleksi dostu, cümleler net olmalı.
    - Tasarım: A4 SAYFASINI TAM DOLDURACAK YOĞUNLUKTA, dopdolu bir içerik üret.
    - Duygusal zeka (EQ) öğeleri içermeli.
    - Hikaye en az 250 kelime olmalı.
    - MUTLAKA aşağıdaki JSON formatında döndür.

    JSON FORMATI:
    {
      "title": "Hikaye Başlığı",
      "storyText": "Hikayenin tamamı...",
      "analysis": {
        "mainIdea": "Ana fikir",
        "supportingIdeas": ["Yardımcı fikir 1", "Yardımcı fikir 2"],
        "characters": [
          { "name": "İsim", "traits": ["Özellik 1", "Özellik 2"], "role": "Rol" }
        ],
        "setting": { "place": "Detaylı yer", "time": "Detaylı zaman" },
        "plot": {
          "exposition": "Giriş (Neyle başladı?)",
          "risingAction": "Gelişme (Olaylar nasıl gelişti?)",
          "resolution": "Sonuç (Nasıl bitti?)"
        }
      },
      "pedagogicalNote": "Öğretmen için teknik açıklama"
    }
  `;

  try {
    const result = await generateCreativeMultimodal({ prompt });
    
    if (!result || !result.storyText) {
      throw new AppError('AI Hikaye Analizi üretilemedi.', 'GENERATION_FAILED', 500);
    }

    return {
      success: true,
      data: result,
      metadata: { difficulty, ageGroup, generatedAt: new Date().toISOString() }
    };
  } catch (error: any) {
    throw new AppError('Hikaye Analizi üretilirken hata: ' + error.message, 'AI_ERROR', 500);
  }
};
