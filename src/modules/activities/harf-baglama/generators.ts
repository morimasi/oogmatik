import { generateWithSchema } from '../../../services/geminiClient';
import { GeneratorOptions } from '../../../types';
import { ActivityType } from '../../../types/activity';

/**
 * Harf Bağlama Etkinliği AI Üretici (Premium Revizyon)
 */
export const generateHARF_BAGLAMAFromAI = async (options: GeneratorOptions) => {
  const difficulty = options.difficulty || 'Orta';
  const itemCount = Number((options as any).count || (options as any).itemCount) || 10;

  const prompt = `
    [ROL: Uluslararası Uzman Pedagog / Özel Eğitim Uzmanı]
    GÖREV: Disleksi veya öğrenme güçlüğü çeken çocuklar için 'Harf Eşleştirme & Bağlama' aktivite verisi (Büyük harfi küçük harfle eşleştirme) üretmek.
    ZORLUK SEVİYESİ: ${difficulty}
    SAYI (Öğe Sayısı): ${itemCount}

    PEDAGOJİK KURALLAR:
    1. İçerik büyük harf ("leftItem") ile onun küçük formu ("rightItem") olacak şekilde tasarlanmalıdır. (Örn: A -> a)
    2. Sağdaki öğeleri ('rightItem') TAMAMEN KARIŞIK sırala! Soldaki sıra ile aynı HİZAYA gelmemelidir! 
    3. ZORLUK 'Kolay' ise: Görsel olarak hiç benzemeyen harflere odaklan. (A, E, M vs.) 'b', 'd', 'p', 'q', 'm', 'n' gibi karışan harfleri KULLANMA.
    4. ZORLUK 'Zor' ise: Özel spesifik harfleri (örn: b-d eşleştirmesi, p-q) zorlamak için aralara yerleştir.
    5. Öğretmen için detaylı bir 'pedagogicalNote' yaz.
  `;

  const schema = {
    type: 'OBJECT',
    properties: {
      instruction: { type: 'STRING', description: "Öğrenciye yönelik samimi yönerge." },
      pedagogicalNote: { type: 'STRING', description: "Klinik uzman veya öğretmen için tavsiye notu." },
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
    required: ['instruction', 'pedagogicalNote', 'items']
  };

  const result = await generateWithSchema(prompt, schema);

  return {
    type: ActivityType.HARF_BAGLAMA,
    title: 'Harf Bağlama Etkinliği (Yapay Zeka)',
    difficulty,
    totalItems: result.items?.length || itemCount,
    ...result,
  };
};
