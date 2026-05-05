import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';

/**
 * Infographic Kısa Cevaplı Sorular AI Üretici
 */
export const generateInfographicShortAnswerFromAI = async (options: GeneratorOptions) => {
  const { 
    difficulty, 
    itemCount = 15, 
    ageGroup = '8-10',
    profile = 'general',
    topic = 'Genel Bilgi',
    params = {}
  } = options;

  const colorMode = params.colorMode || 'Karma Renkli';
  const lineCount = params.lineCount || '2';

  const prompt = `
[ROL: EĞİTİM İÇERİK UZMANI]
GÖREV: Infographic formatında kısa cevaplı soru etkinliği üret.

PARAMETRELER:
- Konu: ${topic}
- Zorluk: ${difficulty}
- Yaş Grubu: ${ageGroup}
- Profil: ${profile}
- Soru Sayısı: ${itemCount}
- Cevap Satır Sayısı: ${lineCount}
- Renk Modu: ${colorMode}

KURALLAR:
1. Sorular yaş grubuna uygun olmalı
2. Cevaplar kısa ve net olmalı (1-3 kelime)
3. Her soru pedagojik değer taşımalı
4. Bilgiler doğru ve güncel olmalı
5. Zorluk seviyesine göre soru karmaşıklığı ayarlanmalı

ZORLUK SEVİYELERİ:
- Başlangıç: Temel bilgiler, günlük hayat
- Orta: Okul bilgisi, genel kültür
- Zor: Detaylı bilgi, uzmanlık gerektiren

PEDAGOJİK NOT:
Bu etkinlik öğrencilerin bilgiyi hatırlama, anlama ve kısa ifade etme becerilerini geliştirir. 
Kısa cevap formatı, öğrencilerin bilgiyi özleştirme yeteneğini artırır.

ÇIKTI FORMATI (JSON):
{
  "instruction": "Soruları oku ve kısa cevaplarını yaz.",
  "questions": [
    {
      "question": "Soru metni",
      "answer": "Kısa cevap",
      "difficulty": 2
    }
  ],
  "pedagogicalNote": "Pedagojik açıklama"
}
  `;

  const schema = {
    type: 'OBJECT',
    properties: {
      instruction: { type: 'STRING' },
      questions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            question: { type: 'STRING' },
            answer: { type: 'STRING' },
            difficulty: { type: 'NUMBER' },
          },
          required: ['question', 'answer', 'difficulty'],
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
    required: ['instruction', 'questions', 'pedagogicalNote'],
  };

  const result = await generateWithSchema(prompt, schema);

  // Worksheet formatına dönüştür
  return {
    id: crypto.randomUUID(),
    activityType: 'INFOGRAPHIC_SHORT_ANSWER',
    title: 'Kısa Cevaplı Sorular',
    instruction: result.instruction,
    difficultyLevel: difficulty,
    ageGroup: ageGroup,
    profile: profile,
    questions: result.questions.map((q: any, i: number) => ({
      ...q,
      id: `q${i + 1}`
    })),
    colorMode: colorMode,
    lineCount: parseInt(lineCount),
    pedagogicalNote: result.pedagogicalNote
  };
};
