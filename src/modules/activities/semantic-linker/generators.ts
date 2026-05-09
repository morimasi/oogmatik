import { SemanticLinkerData } from './types';
import { generateWithSchema } from '../../../services/geminiClient';


export const generateSemanticLinkerAI = async (
  prompt: string,
  count: number = 5
): Promise<SemanticLinkerData> => {
  const schema = {
    type: "OBJECT",
    properties: {
      instruction: { type: "STRING" },
      items: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            targetWord: { type: "STRING" },
            isNegated: { type: "BOOLEAN" },
            options: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  id: { type: "STRING" },
                  label: { type: "STRING" },
                  isCorrect: { type: "BOOLEAN" }
                }
              }
            },
            correctAnswerId: { type: "STRING" },
            pedagogicalNote: { type: "STRING" }
          }
        }
      }
    }
  };

  const fullPrompt = `
    Sen Kıdemli bir Özel Eğitim Materyal Tasarımcısısın. 
    İlkokul seviyesindeki disleksi ve DEHB olan çocuklar için "Anlamsal İlişki Kurma" etkinliği hazırla.
    
    KURALLAR:
    1. Hedef kelime ile seçenekler arasında net bir mantıksal bağ olmalı.
    2. Soruların yarısı negatif formatta olsun ("... hangisiyle ilişkili DEĞİLDİR?").
    3. Kelimeler somut, günlük hayattan ve görselleştirilebilir olmalı.
    4. Her soru için 3 seçenek (a, b, c) üret.
    
    Kullanıcı İsteği: ${prompt}
    Soru Sayısı: ${count}
  `;

  const result = await generateWithSchema(fullPrompt, schema);
  return result as SemanticLinkerData;
};

export const generateSemanticLinkerOffline = (count: number = 5): SemanticLinkerData => {
  return {
    instruction: "Kelimeler ile nesneler arasındaki ilişkiyi bulup işaretleyelim.",
    items: [
      {
        id: 'off-1',
        targetWord: 'Uzun',
        isNegated: false,
        options: [
          { id: 'a', label: 'Arı', isCorrect: false },
          { id: 'b', label: 'Top', isCorrect: false },
          { id: 'c', label: 'Zürafa', isCorrect: true }
        ],
        correctAnswerId: 'c',
        pedagogicalNote: 'Karakteristik özellik eşleşmesi.'
      },
      {
        id: 'off-2',
        targetWord: 'Islak',
        isNegated: true,
        options: [
          { id: 'a', label: 'Şemsiye', isCorrect: false },
          { id: 'b', label: 'Aslan', isCorrect: true },
          { id: 'c', label: 'Duş', isCorrect: false }
        ],
        correctAnswerId: 'b',
        pedagogicalNote: 'Kategori dışı olanı bulma (Olumsuzlama).'
      }
    ].slice(0, count)
  };
};
