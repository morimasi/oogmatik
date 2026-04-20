import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { AppError } from '../../utils/AppError';

/**
 * Eksik Parçaları Tamamlama (Ultra Pro) Aktivite Üreticisi
 * Bağlamsal okuma ve anlam bütünlüğü üzerine odaklanır.
 */
export const generateMissingPartsFromAI = async (options: GeneratorOptions): Promise<any> => {
  const { difficulty = 'orta', ageGroup = '8-10', topic = 'Doğa' } = options;

  const prompt = `
    Sen bir Dil ve Konuşma Terapisti uzmanısın. Disleksi olan çocuklar için "Eksik Parçaları Tamamlama" (Cloze Test) etkinliği üret.

    GÖREV:
    1. Konuyla ilgili ${difficulty === 'zor' ? '3-4' : '2'} paragraf uzunluğunda ilginç ve detaylı bir metin yaz.
    2. Metin içinden kritik bağlaçlar, sıfatlar veya anlamlı isimleri çıkararak boşluklar (_____) oluştur. (A4 SAYFASINI TAM DOLDURACAK YOĞUNLUKTA)
    3. Metni "parçalar" (parts) halinde yapılandır; her parça ya düz metin ya da bir boşluk olmalı.

    KURALLAR:
    - Boşluk sayısı: ${difficulty === 'zor' ? '12-15' : '8-10'}.
    - Kelime Kutusu (Word Bank): Öğrenciye yardımcı olmak için doğru cevapları + 4 çeldiriciyi karışık bir listede sun.
    - Tasarım: Sayfa dopdolu olmalı, boşluklar arasında yeterli metin yoğunluğu sağlanmalı.
    - Yaş grubu: ${ageGroup}.
    - Çıktı MUTLAKA aşağıdaki JSON formatında olmalı.

    JSON FORMATI:
    {
      "title": "Metindeki Eksikleri Tamamla",
      "instruction": "Aşağıdaki metni okuyunuz ve kutu içindeki kelimeleri uygun boşluklara yerleştiriniz.",
      "content": {
        "title": "Hikaye Başlığı",
        "paragraphs": [
          {
            "parts": [
              { "text": "Bir gün sabah ", "isBlank": false },
              { "text": "erkenden", "isBlank": true, "answer": "erkenden" },
              { "text": " kalktım.", "isBlank": false }
            ]
          }
        ],
        "wordBank": ["erkenden", "koşarak", "mutlu", "kitap"]
      },
    }
  `;

  try {
    const result = await generateCreativeMultimodal({ prompt });
    
    if (!result || !result.content) {
      throw new AppError('AI Eksik Parçaları Tamamlama üretilemedi.', 'GENERATION_FAILED', 500);
    }

    return {
      success: true,
      data: result,
      metadata: { difficulty, ageGroup }
    };
  } catch (error: any) {
    throw new AppError('Eksik Parçaları Tamamlama üretilirken hata: ' + error.message, 'AI_ERROR', 500);
  }
};
