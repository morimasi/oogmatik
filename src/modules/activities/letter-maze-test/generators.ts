import { generateWithSchema } from '../../services/geminiClient.js';
import { GeneratorOptions } from '../../../types.js';

/**
 * Harf Labirenti Test AI Üretici
 */
export const generateLETTER_MAZE_TESTFromAI = async (options: GeneratorOptions) => {
  const { difficulty, itemCount = 10 } = options;

  const prompt = `
    [ROL: Disleksi Eğitim Uzmanı]
    GÖREV: Harf labirenti için 10x10'luk bir ızgara ve içinde gizli bir kelime yolu oluştur.
    ZORLUK: ${difficulty}
    SAYI: ${itemCount}

    KURALLAR:
    - Sadece büyük harf kullan
    - Kelime yolu dikey veya yatay olabilir
    - Çeldiriciler benzer şekilli harflerden oluşmalı
    
    ÇIKTI FORMATI (JSON):
    {
      "items": [
        { "character": "A", "isPath": true }
      ]
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
          "type": "OBJECT",
          "properties": {
            "character": { "type": "STRING" },
            "isPath": { "type": "BOOLEAN" }
          }
        }
      }
    },
    required: ['instruction', 'items', 'pedagogicalNote']
  };

  return await generateWithSchema(prompt, schema);
};
