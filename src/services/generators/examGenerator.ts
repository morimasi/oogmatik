import { generateWithSchema } from '../geminiClient';
import { AppError } from '../../utils/AppError';
import { ExamQuestionType, ExamQuestion, ExamActivityData } from '../../types/exam';

export interface ExamParams {
  gradeLevel: number | string;
  unit: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  questionCount: number;
  types: ExamQuestionType[];
}

const EXAM_SCHEMA = {
  type: 'OBJECT',
  properties: {
    pedagogicalNote: {
      type: 'STRING',
      description: 'Öğretmen için pedagojik açıklama ve ZPD uyum bilgisi. En az 10 karakter.',
    },
    questions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          type: {
            type: 'STRING',
            enum: ['multiple-choice', 'true-false', 'fill-in-blanks', 'open-ended'],
          },
          questionText: { type: 'STRING' },
          bloomLevel: {
            type: 'STRING',
            enum: ['Bilgi', 'Kavrama', 'Uygulama', 'Analiz', 'Değerlendirme', 'Sentez'],
          },
          realLifeConnection: { type: 'STRING' },
          solutionKey: { type: 'STRING' },
          options: {
            type: 'OBJECT',
            properties: {
              A: { type: 'STRING' },
              B: { type: 'STRING' },
              C: { type: 'STRING' },
              D: { type: 'STRING' },
            },
          },
          correctOption: { type: 'STRING', enum: ['A', 'B', 'C', 'D'] },
          isTrue: { type: 'BOOLEAN' },
          blankedText: { type: 'STRING' },
          correctWords: { type: 'ARRAY', items: { type: 'STRING' } },
          expectedKeywords: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['id', 'type', 'questionText', 'bloomLevel', 'realLifeConnection', 'solutionKey'],
      },
    },
  },
  required: ['pedagogicalNote', 'questions'],
};

export const generateExamQuestions = async (params: ExamParams): Promise<ExamActivityData> => {
  try {
    const chunkCount = Math.ceil(params.questionCount / 10);
    const chunks = Array.from({ length: chunkCount }, (_, i) => {
      const isLast = i === chunkCount - 1;
      const count = isLast && params.questionCount % 10 !== 0 ? params.questionCount % 10 : 10;
      return { count, index: i };
    });

    const promises = chunks.map(async (chunk) => {
      const prompt = `
Sen MEB müfredatına hakim, disleksi dostu içerik üreten bir Türkçe öğretmenisin.
KESİNLİKLE "disleksi", "öğrenme güçlüğü", "tanı" gibi teşhis koyucu dil kullanma. Onun yerine "destekleyici", "pekiştirici" ifadeler kullan.
Tüm içerik Türkçe olmalıdır.
ZPD (Yakınsal Gelişim Alanı) uyumunu sağlamak için pedagojik not eklemelisin.
Lexend font kuralı arayüzde sağlanacaktır.

Sınıf: ${params.gradeLevel}
Ünite/Konu: ${params.unit}
Zorluk: ${params.difficulty}
Soru Sayısı: ${chunk.count}
Soru Tipleri: ${params.types.join(', ')}

Lütfen belirtilen kriterlere uygun ${chunk.count} adet soru üret.
Her sorunun Bloom taksonomisine uygun bir seviyesi ve gerçek hayat bağlantısı olmalı.
Çıktıda bir 'pedagogicalNote' ve 'questions' dizisi bulunmalıdır.
`;

      const result = await generateWithSchema(prompt, EXAM_SCHEMA);
      return result;
    });

    const results = await Promise.all(promises);

    const allQuestions: ExamQuestion[] = [];
    let pedagogicalNote = 'Pedagojik not oluşturulamadı.';

    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (i === 0 && res?.pedagogicalNote) {
        pedagogicalNote = res.pedagogicalNote;
      }

      if (res && res.questions && Array.isArray(res.questions)) {
        res.questions.forEach((q: any) => {
          const question = { ...q } as any;
          if (!question.id) {
            question.id = Math.random().toString(36).substring(2, 15);
          }
          allQuestions.push(question as ExamQuestion);
        });
      }
    }

    return {
      title: `${params.gradeLevel}. Sınıf ${params.unit} Sınavı`,
      pedagogicalNote,
      questions: allQuestions,
    };
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Sınav soruları üretilirken bir hata oluştu.', 'INTERNAL_ERROR', 500);
  }
};
