import { generateWithSchema } from '../../../services/geminiClient';
import { GeneratorOptions } from '../../../types';
import { ActivityType } from '../../../types/activity';
import { HarfBaglamaMode, HarfBaglamaCategory, HarfBaglamaDifficulty } from './types';

/**
 * Harf Bağlama Etkinliği AI Üretici (Premium Revizyon)
 */
export const generateHARF_BAGLAMAFromAI = async (options: GeneratorOptions) => {
  const difficulty = (options.difficulty as HarfBaglamaDifficulty) || 'Orta';
  const itemCount = Number((options as any).itemCount) || 10;
  const mode = (options.mode as HarfBaglamaMode) || 'standard';
  const category = (options.category as HarfBaglamaCategory) || 'genel';
  const fontSize = Number((options as any).fontSize) || 10;
  const primaryColor = (options.primaryColor as string) || '#4f46e5';
  const secondaryColor = (options.secondaryColor as string) || '#ec4899';

  const isGirlMode = mode === 'girl';
  const title = isGirlMode ? 'Prenses Harf Bağlama (Yapay Zeka)' : 'Harf Bağlama Etkinliği (Yapay Zeka)';

  const prompt = `
    [ROL: Uluslararası Uzman Pedagog / Özel Eğitim Uzmanı]
    GÖREV: Disleksi veya öğrenme güçlüğü çeken çocuklar için 'Harf Eşleştirme & Bağlama' aktivite verisi (Büyük harfi küçük harfle eşleştirme) üretmek.
    ZORLUK SEVİYESİ: ${difficulty}
    SAYI (Öğe Sayısı): ${itemCount}
    MOD: ${isGirlMode ? 'Kızlım / Prenses teması' : 'Standart'}
    KATEGORİ: ${category}

    PEDAGOJİK KURALLAR:
    1. İçerik büyük harf ("leftItem") ile onun küçük formu ("rightItem") olacak şekilde tasarlanmalıdır. (Örn: A -> a)
    2. Zorluk 'Kolay' ise: Görsel olarak hiç benzemeyen harflere odaklan. (A, E, M vs.) 'b', 'd', 'p', 'q', 'm', 'n' gibi karışan harfleri KULLANMA.
    3. Zorluk 'Zor' ise: Özel spesifik harfleri (örn: b-d eşleştirmesi, p-q) zorlamak için aralara yerleştir.
    4. Yönerge, ${isGirlMode ? 'prenses, sihirli kelime dünyası, pembe-purple tonları temalı ve eğlenceli' : 'samimi ve net'} olsun.
  `;

  const schema = {
    type: 'OBJECT',
    properties: {
      instruction: { type: 'STRING', description: "Öğrenciye yönelik samimi yönerge." },
      items: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            leftItem: { type: 'STRING' },
            rightItem: { type: 'STRING' }
          },
          required: ['id', 'leftItem', 'rightItem']
        }
      }
    },
    required: ['instruction', 'items']
  };

  const result = await generateWithSchema(prompt, schema) as Record<string, unknown>;

  return {
    type: ActivityType.HARF_BAGLAMA,
    title,
    instruction: result.instruction,
    items: result.items,
    difficulty,
    mode,
    category,
    itemCount,
    fontSize,
    primaryColor,
    secondaryColor,
    totalItems: (result.items as Array<unknown>)?.length || itemCount,
  };
};
