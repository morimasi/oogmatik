import { generateWithSchema } from '../../../services/geminiClient';
import { GeneratorOptions } from '../../../types/core';

/**
 * Harf Bağlama AI Üretici
 */
export const generateLETTER_CONNECTFromAI = async (options: GeneratorOptions) => {
  const { difficulty, itemCount = 10 } = options;

  const prompt = `
    [ROL: Özel Eğitim Uzmanı]
    GÖREV: Disleksisi olan öğrenciler için gerçek hayatta kullanılabilecek, doğru kurgulanmış harf ve hece eşleştirme etkinliği oluştur. b-d, p-q gibi harfleri zorluk seviyesine göre ayarla.
    ZORLUK: ${difficulty}
    SAYI: ${itemCount}

    KURALLAR:
    
    - Başarı hissiyatını yüksek tut.
    
    - Açık, anlaşılır ve doğru Türkçe kullan.
    
    - Öğrencinin motivasyonunu sarsacak ifadelerden kaçın.
    
    
    ÇIKTI FORMATI (JSON):
    {
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object"
      }
    }
  }
}
    `;

  const schema = {
    type: 'OBJECT',
    properties: {
      instruction: { type: 'STRING' },
      pedagogicalNote: { type: 'STRING' },
      items: {
        type: 'ARRAY',
        items: {
          "type": "object"
        }
      }
    },
    required: ['instruction', 'items', 'pedagogicalNote']
  };

  return await generateWithSchema(prompt, schema);
};
