import { generateCreativeMultimodal } from '../../../../services/geminiClient';
import { Question, TextPassage } from '../types/schemas';

interface GenerateOptions {
  text: string;
  count?: number;
  difficulty?: 'KOLAY' | 'ORTA' | 'ZOR';
  skills?: string[];
  gradeLevel?: 1 | 2 | 3 | 4;
}

const questionSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      textId: { type: 'string' },
      type: { type: 'string', enum: ['MCQ', 'FILL_BLANK', 'TRUE_FALSE'] },
      instruction: { type: 'string' },
      difficulty: { type: 'string', enum: ['KOLAY', 'ORTA', 'ZOR'] },
      targetSkill: {
        type: 'string',
        enum: ['ANA_FIKIR', 'SEBEP_SONUC', 'SOZ_VARLIGI', 'YAZIM_NOKTALAMA', 'MANTIK'],
      },
      learningOutcomes: { type: 'array', items: { type: 'string' } },
      feedback: {
        type: 'object',
        properties: {
          correct: { type: 'string' },
          incorrect: { type: 'string' },
        },
      },
      // MCQ fields
      options: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            text: { type: 'string' },
            isCorrect: { type: 'boolean' },
          },
        },
      },
      // FILL_BLANK fields
      template: { type: 'string' },
      blanks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            correctValue: { type: 'string' },
            acceptedValues: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      wordBank: { type: 'array', items: { type: 'string' } },
    },
    required: ['id', 'textId', 'type', 'instruction', 'difficulty', 'targetSkill', 'feedback'],
  },
};

// Mock fallback questions for when API is unavailable
const getMockQuestions = (difficulty: 'KOLAY' | 'ORTA' | 'ZOR' = 'ORTA'): Question[] => [
  {
    id: `q-mcq-${Date.now()}`,
    textId: 'generated-text-id',
    type: 'MCQ',
    instruction: 'Metne göre aşağıdaki soruyu cevaplayınız.',
    difficulty,
    targetSkill: 'ANA_FIKIR',
    learningOutcomes: ['T.2.3.1'],
    feedback: {
      correct: 'Harika! Metnin ana fikrini çok iyi kavradın.',
      incorrect: 'Metnin genelinde ne anlatılmak istendiğine tekrar odaklan.',
    },
    options: [
      { id: 'opt-1', text: 'Doğa sevgisi her şeyden önemlidir.', isCorrect: true },
      { id: 'opt-2', text: 'Sadece teknoloji önemlidir.', isCorrect: false },
      { id: 'opt-3', text: 'Arkadaşlarımızla oynamalıyız.', isCorrect: false },
    ],
  },
  {
    id: `q-blank-${Date.now() + 1}`,
    textId: 'generated-text-id',
    type: 'FILL_BLANK',
    instruction: 'Aşağıdaki cümleyi metne uygun şekilde tamamla.',
    difficulty,
    targetSkill: 'SOZ_VARLIGI',
    learningOutcomes: ['T.2.4.1'],
    feedback: {
      correct: 'Kelimeleri yerine çok iyi yerleştirdin!',
      incorrect: 'İpucu: Kelime havuzunu kullanabilirsin.',
    },
    template: 'Doğayı korumak için {blank_1} çok dikkatli davranmalıyız.',
    blanks: [{ id: 'blank_1', correctValue: 'hepimiz', acceptedValues: ['Hepimiz', 'hepimiz'] }],
    wordBank: ['hepimiz', 'sadece sen', 'hiçbirimiz'],
  },
];

/**
 * Magic Generator: Gerçek Gemini API ile metin üzerinden disleksi dostu sorular üretir.
 * API'ye erişilemeyen durumlarda otomatik olarak mock veriye düşer (Graceful Degradation).
 */
export const generateQuestionsFromText = async (options: GenerateOptions): Promise<Question[]> => {
  const count = options.count || 5;
  const difficulty = options.difficulty || 'ORTA';

  const prompt = `
Sen, Türkçe eğitim materyalleri üreten bir uzman öğretmensin.
Aşağıdaki metni analiz ederek disleksili ilkokul öğrencileri için ${count} adet soru üret.

**METİN:**
"""
${options.text}
"""

**KURAL VE KISITLAR:**
- Zorluk seviyesi: ${difficulty}
- Sınıf seviyesi: ${options.gradeLevel || 2}. sınıf
- Cümleler kısa, net ve basit olmalı (disleksi dostu)
- Her soruda "id" alanı benzersiz bir UUID formatında olmalı (örn: "q-${Date.now()}-1")
- textId alanını "generated-text-id" olarak ayarla
- Talimatlar Türkçe, anlaşılır ve model bir öğrenci için uygun olmalı
- Çoktan seçmeli sorularda mutlaka bir "isCorrect: true" olan seçenek olmalı
- Boşluk doldurma sorularında "{blank_1}" gibi placeholder kullan
- En az 1 MCQ, 1 FILL_BLANK soru üret. Kalan sorular için uygun tip seç.
- Odaklanan beceriler: ${(options.skills || ['ANA_FIKIR', 'SOZ_VARLIGI']).join(', ')}

Sadece JSON array döndür, başka açıklama ekleme.
`;

  try {
    console.log(`[MagicGenerator] Gemini'ye ${count} soru üretme isteği gönderiliyor...`);
    const result = await generateCreativeMultimodal({
      prompt,
      schema: questionSchema,
      temperature: 0.3,
      thinkingBudget: 1000,
    });

    // Ensure result is an array
    const questions: Question[] = Array.isArray(result) ? result : result?.questions || [];
    if (questions.length === 0) throw new Error('Boş soru listesi döndü');

    console.log(`[MagicGenerator] ${questions.length} soru başarıyla üretildi.`);
    return questions;
  } catch (error: any) {
    console.warn('[MagicGenerator] Gemini API hatası, mock veriye düşülüyor:', error?.message);
    return getMockQuestions(difficulty);
  }
};

/**
 * Konu ve sınıf seviyesine göre tam bir TextPassage + sorular üretir.
 */
export const generateFullStudioActivity = async (
  topic: string,
  gradeLevel: 1 | 2 | 3 | 4
): Promise<{ passage: TextPassage; questions: Question[] }> => {
  const prompt = `
Sen, Türkçe ilkokul eğitim materyalleri üretme konusunda uzman bir yapay zekasın.
"${topic}" konusunda ${gradeLevel}. sınıf disleksili öğrenciler için:
1. Kısa, basit cümleli bir okuma metni (50-80 kelime, disleksi dostu)
2. 3 adet anlama sorusu

JSON formatında şu yapıyı döndür:
{
  "passage": {
    "id": "text-[timestamp]",
    "title": "Metin başlığı",
    "content": "Metin içeriği...",
    "metadata": {
      "gradeLevel": ${gradeLevel},
      "difficulty": "KOLAY",
      "theme": "HIKAYE",
      "wordCount": 60,
      "readabilityScore": 85,
      "estimatedReadingTimeMs": 45000
    },
    "learningOutcomes": ["T.${gradeLevel}.2.1"]
  },
  "questions": []
}
`;

  try {
    const result = await generateCreativeMultimodal({ prompt, temperature: 0.5 });
    const passage = result?.passage;
    if (!passage?.title) throw new Error('Geçersiz passage yapısı');

    // Sonradan sorular üret
    const questions = await generateQuestionsFromText({
      text: passage.content,
      count: 3,
      difficulty: 'KOLAY',
      gradeLevel,
    });

    return { passage, questions };
  } catch (error: any) {
    console.warn('[MagicGenerator] Gemini API hatası, fallback veriye düşülüyor:', error?.message);
    return {
      passage: {
        id: `text-${Date.now()}`,
        title: `${topic} Hakkında Bir Hikaye`,
        content: `${topic} çok ilginç bir konudur. Çocuklar parkta oynarken doğanın güzelliklerini fark ettiler. Güneş parlıyor, kuşlar cıvıldıyordu. Herkes çok mutluydu.`,
        metadata: {
          gradeLevel,
          difficulty: 'KOLAY',
          theme: 'HIKAYE',
          wordCount: 22,
          readabilityScore: 90,
          estimatedReadingTimeMs: 30000,
        },
        learningOutcomes: ['T.1.2.1'],
      },
      questions: getMockQuestions('KOLAY'),
    };
  }
};
