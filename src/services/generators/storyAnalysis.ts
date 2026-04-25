import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { AppError } from '../../utils/AppError';

/**
 * Hikaye Analizi (Ultra Pro) Aktivite Üreticisi
 * Derinlemesine anlama, karakter analizi ve olay örgüsü tespiti yapar.
 */
export const generateStoryAnalysisFromAI = async (options: GeneratorOptions): Promise<any> => {
  const { 
    difficulty = 'Orta', 
    ageGroup = '8-10', 
    topic = 'Genel Çocuk Hikayesi',
    analysisDepth = 'detaylı',
    showStoryMap = true,
  } = options as any;

  const prompt = `
    Sen bir Dil Bilgisi ve Okuma Anlama Uzmanısın (Elif Yıldız rolünde). 
    Disleksi ve DEHB olan çocuklar için "Ultra Pro" seviyesinde bir "Hikaye Analizi" etkinliği üret.

    GÖREV:
    1. Özgün, merak uyandırıcı ve pedagojik değeri olan bir hikaye yaz. 
       - Konu: ${topic}
       - Yaş Grubu: ${ageGroup}
       - Anlatım Düzeyi: ${difficulty}
       - Analiz Derinliği: ${analysisDepth}
    2. Hikaye için derinlemesine analiz bileşenleri oluştur.
    3. Metnin içeriğini tartışmaya açacak 3 analitik soru hazırla.

    KURALLAR:
    - Dil disleksi dostu, cümleler net olmalı.
    - Duygusal zeka (EQ) öğeleri içermeli.
    - Hikaye dopdolu ve etkileyici bir olay örgüsüne sahip olmalı (En az 250 kelime).
    - MUTLAKA aşağıdaki JSON formatında döndür. BAŞKA HİÇBİR AÇIKLAMA YAZMA.

    JSON FORMATI:
    {
      "title": "Hikaye Analizi • Ultra Pro",
      "instruction": "Metni dikkatlice oku ve analiz bölümlerini inceleyerek anlama yeteneğini test et.",
      "pedagogicalNote": "Bu çalışma öğrencinin çıkarım yapma, ana fikri kavrama ve karakter-mekan ilişkisini kurma becerilerini geliştirir.",
      "imagePrompt": "Hikayeyi anlatan disleksi dostu, yumuşak pastel renkli çocuk kitabı tarzında bir illüstrasyon",
      "content": {
        "title": "Hikayenin Kendi Başlığı",
        "story": "Hikayenin detaylı ve eksiksiz metni...",
        "analysis": {
          "mainIdea": "Metnin ana fikri",
          "characters": [
            { "name": "Karakter İsim", "traits": ["Özellik 1", "Özellik 2"] }
          ],
          "setting": { "place": "Detaylı yer tasviri", "time": "Zaman dilimi" },
          "conflict": "Karakterin çözmesi gereken ana problem veya çatışma nedir?",
          "resolution": "Problem nasıl ve ne şekilde çözüldü?"
        }
      },
      "questions": [
        { "question": "Metinle ilgili derinlemesine mantık yürütebilecekleri 1. soru" },
        { "question": "Karakterin duygularını ve motivasyonunu sorgulayan 2. soru" },
        { "question": "Eğer sen olsaydın ne yapardın veya metin nasıl devam ederdi tarzı 3. yaratıcı soru" }
      ]
    }
  `;

  try {
    const result = await generateCreativeMultimodal({ prompt });
    
    if (!result || !result.content || !result.content.title) {
      throw new AppError('AI Hikaye Analizi JSON formati eksik veya hatali uretildi.', 'GENERATION_FAILED', 500);
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
