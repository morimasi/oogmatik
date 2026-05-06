import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';
import { ActivityType } from '../../types/activity.js';

/**
 * Kısa Cevaplı Sorular AI Üretici - Premium Version
 */
export const generateInfographicShortAnswerFromAI = async (options: GeneratorOptions) => {
  const { 
    difficulty = 'Orta', 
    itemCount = 12, 
    ageGroup = '8-10',
    profile = 'general',
    topic = 'Genel Bilgi',
    params = {}
  } = options;

  const lineCount = params.lineCount || 2;

  const prompt = `
[ROL: KIDEMLİ EĞİTİM TASARIMCISI]
GÖREV: "${topic}" konusu üzerine, ${ageGroup} yaş grubu için ${difficulty} seviyesinde kısa cevaplı sorulardan oluşan bir sayfa dolusu etkinlik üret.

STRATEJİ:
1. Sorular ${difficulty} seviyesine uygun, merak uyandırıcı ve eğitici olmalı.
2. Disleksi dostu kısa ve öz cümleler kullanılmalı.
3. Her soru için kısa bir ipucu verilmeli (opsiyonel ama önerilir).
4. Soru sayısı: ${itemCount}.

PEDAGOJİK HEDEF:
Bu etkinlik, öğrencinin okuduğunu anlama, bilgiyi geri çağırma ve yazılı ifade becerilerini sarmal öğrenme modeliyle destekler.

ÇIKTI FORMATI (JSON):
{
  "title": "${topic} Üzerine Sorular",
  "instruction": "Aşağıdaki soruları dikkatlice okuyup verilen boşluklara kısa yanıtlar veriniz.",
  "questions": [
    {
      "id": "q1",
      "question": "Türkiye'nin başkenti neresidir?",
      "answer": "Ankara",
      "hint": "İç Anadolu'da yer alır."
    }
  ],
  "pedagogicalNote": "Öğrencinin ${topic} konusundaki temel kazanımları pekiştirmesi sağlanır."
}
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      instruction: { type: 'STRING' },
      questions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            question: { type: 'STRING' },
            answer: { type: 'STRING' },
            hint: { type: 'STRING' },
          },
          required: ['id', 'question'],
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
    required: ['title', 'instruction', 'questions', 'pedagogicalNote'],
  };

  const result = await generateWithSchema(prompt, schema);

  // Kısa Cevaplı Sorular Modülü için standartlaştırılmış çıktı
  return {
    id: `short_answer_${Date.now()}`,
    activityType: ActivityType.INFOGRAPHIC_SHORT_ANSWER,
    title: result.title,
    instruction: result.instruction,
    pedagogicalNote: result.pedagogicalNote,
    settings: {
      ...options,
      lineCount: parseInt(String(lineCount))
    },
    content: {
       title: result.title,
       instruction: result.instruction,
       questions: result.questions.map((q: any) => ({
           ...q,
           lines: parseInt(String(lineCount))
       }))
    }
  };
};
