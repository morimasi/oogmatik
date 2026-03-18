import { Type } from '@google/genai';
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';

/**
 * Kutularla Matematik (Ters İşlem & Yerine Koyma) AI Üretici
 */
export const generateBoxMathFromAI = async (options: GeneratorOptions) => {
  const { difficulty, itemCount = 10, variant = 'reverse' } = options;

  const variantDesc =
    variant === 'reverse'
      ? 'Ters İşlem (Verilen denklemde kutunun (□) değerini bulma)'
      : variant === 'substitution'
        ? 'Yerine Koyma (Verilen kutu değerine göre ifadeyi hesaplama)'
        : 'İşlem Sadeleştirme (Kutu terimlerini birleştirme)';

  const prompt = `
    [ROL: MATEMATİK MÜFREDAT UZMANI]
    GÖREV: Kutularla Matematik etkinliği için ${itemCount} adet özgün soru üret.
    MOD: ${variantDesc}
    ZORLUK: ${difficulty}

    KURALLAR:
    1. İfadelerde '□' sembolünü kullan.
    2. İşlemler: Toplama (+), Çıkarma (-), Çarpma (x). (Bölme şimdilik yok)
    3. 'reverse' modunda: "3x□ + 2 - 2x□ = 10" gibi denklemler üret. □=? sorusunu sorma, biz ekleyeceğiz.
    4. 'substitution' modunda: "4x□ + 2 - 2x□ =" gibi ifadeler üret ve yanına "□=3" gibi bir değer ver.
    5. Sayılar tam sayı olmalı. Negatif sonuçlara ve ondalıklı sayılara girme.
    6. Zorluk seviyeleri:
       - Başlangıç: Tek işlem, katsayılar 1-3, sonuçlar 1-20.
       - Orta: 2-3 işlem, katsayılar 1-5, sonuçlar 1-50.
       - Zor: 4+ işlem, katsayılar 1-10, sonuçlar 1-100.
    
    ÇIKTI FORMATI (JSON):
    {
      "instruction": "Kısa, net bir Türkçe yönerge",
      "problems": [
        {
          "expression": "4x□ + 2 - 2x□",
          "targetValue": 10, // Sadece reverse modunda
          "givenValue": 3,   // Sadece substitution modunda
          "answer": 2        // Reverse ise kutunun değeri, substitution ise ifadenin sonucu
        }
      ]
    }
    `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      instruction: { type: Type.STRING },
      problems: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            expression: { type: Type.STRING },
            targetValue: { type: Type.NUMBER },
            givenValue: { type: Type.NUMBER },
            answer: { type: Type.NUMBER },
          },
          required: ['expression', 'answer'],
        },
      },
    },
    required: ['instruction', 'problems'],
  };

  return await generateWithSchema(prompt, schema);
};
