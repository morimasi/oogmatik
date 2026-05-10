import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';

/**
 * Harf Bağlama Etkinliği AI Üretici
 */
export const generateHARF_BAGLAMAFromAI = async (options: GeneratorOptions) => {
  const { difficulty, itemCount = 10 } = options;

  const prompt = `
    [ROL: ]
    GÖREV: HarfBaglamaData formatına uygun eşleştirme aktivitesi üret.
    ZORLUK: ${difficulty}
    SAYI: ${itemCount}

    KURALLAR:
    
    - Sadece anlamlı veya alfabedeki harf karşılıklarını kullan.
    
    - Öğrencinin kafasını karıştıracak benzer harfleri (b-d) ilk seviyelerde kullanma.
    
    
    ÇIKTI FORMATI (JSON):
    undefined
    `;

  const schema = {
    type: 'OBJECT',
    properties: {
      instruction: { type: 'STRING' },
      pedagogicalNote: { type: 'STRING' },
      items: {
        type: 'ARRAY',
        items: undefined
      }
    },
    required: ['instruction', 'items', 'pedagogicalNote']
  };

  const result = await generateWithSchema(prompt, schema);
  return {
    type: 'HARF_BAGLAMA',
    title: 'Harf Bağlama Etkinliği',
    ...result
  };
};
