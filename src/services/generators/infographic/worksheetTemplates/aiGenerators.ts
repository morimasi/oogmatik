/**
 * aiGenerators.ts — AI destekli etkinlik üreticileri
 * Konu bazlı, bağlamsal içerik gerektiren şablonlar için Gemini 2.5 Flash kullanır.
 *
 * Selin Arslan: gemini-2.5-flash sabit, prompt yapısı ROL+HEDEF+KISIT+ÇIKTI
 */

import { generateCreativeMultimodal } from '../../../geminiClient';
import { AppError } from '../../../../utils/AppError';
import type {
  WorksheetActivityData,
  WorksheetGeneratorParams,
  WorksheetGeneratorFn,
  WorksheetTemplateType,
  WorksheetActivityCategory,
} from '../../../../types/worksheetActivity';

const SYSTEM_INSTRUCTION = `Sen Oogmatik platformunun "Etkinlik Oluşturucu Stüdyosu" baş pedagojik tasarımcısısın.
Görevin: Öğrencinin KALEMLE yazıp çizeceği, çözeceği interaktif çalışma kağıdı etkinlikleri üretmek.
ASLA bilgilendirici infografik üretme. Sadece öğrencinin aktif katılacağı etkinlikler üret.
Her etkinlik bölümünde (section) mutlaka bir "cevap alanı" olmalı (boşluk, kutu, eşleştirme çizgisi vb.).
Yönergeler Türkçe, net ve en fazla 2 cümle olmalı. İlk soru/madde her zaman KOLAY olmalı (güven inşası).
pedagogicalNote alanında öğretmene en az 80 kelimelik bilimsel açıklama yaz.
Tanı koyucu dil kullanma ("disleksisi var" değil, "disleksi desteğine ihtiyacı olan" de).`;

interface AIGenConfig {
  templateType: WorksheetTemplateType;
  category: WorksheetActivityCategory;
  activityName: string;
  promptDetail: string;
}

function buildSchema() {
  return {
    type: 'OBJECT' as const,
    properties: {
      title: { type: 'STRING' as const },
      generalInstruction: { type: 'STRING' as const },
      pedagogicalNote: { type: 'STRING' as const },
      estimatedDuration: { type: 'NUMBER' as const },
      targetSkills: { type: 'ARRAY' as const, items: { type: 'STRING' as const } },
      sections: {
        type: 'ARRAY' as const,
        items: {
          type: 'OBJECT' as const,
          properties: {
            instruction: { type: 'STRING' as const },
            content: { type: 'STRING' as const },
            options: { type: 'ARRAY' as const, items: { type: 'STRING' as const } },
            correctAnswer: { type: 'STRING' as const },
            matchingPairs: {
              type: 'ARRAY' as const,
              items: {
                type: 'OBJECT' as const,
                properties: {
                  left: { type: 'STRING' as const },
                  right: { type: 'STRING' as const },
                },
                required: ['left', 'right'],
              },
            },
            gridData: {
              type: 'ARRAY' as const,
              items: { type: 'ARRAY' as const, items: { type: 'STRING' as const } },
            },
            answerArea: {
              type: 'OBJECT' as const,
              properties: {
                type: {
                  type: 'STRING' as const,
                  description:
                    "Cevap formatı: 'blank-line', 'blank-box', 'multiple-choice', 'true-false-check', 'matching-lines', 'classification-table', 'drawing-area', 'grid', 'numbering', 'circle-mark'",
                },
                lines: { type: 'NUMBER' as const },
                gridSize: {
                  type: 'OBJECT' as const,
                  properties: {
                    rows: { type: 'NUMBER' as const },
                    cols: { type: 'NUMBER' as const },
                  },
                  required: ['rows', 'cols'],
                },
              },
              required: ['type'],
            },
          },
          required: ['instruction', 'content', 'answerArea'],
        },
      },
    },
    required: ['title', 'generalInstruction', 'pedagogicalNote', 'sections', 'targetSkills'],
  };
}

function createAIWorksheetGenerator(config: AIGenConfig): WorksheetGeneratorFn {
  return async (params: WorksheetGeneratorParams): Promise<WorksheetActivityData> => {
    const userPrompt = `
Etkinlik: ${config.activityName}
Konu: ${params.topic || 'Genel'}
Yaş Grubu: ${params.ageGroup}
Zorluk: ${params.difficulty}
Öğrenme Profili: ${params.profile}
Soru/Madde Sayısı: ${params.sectionCount}

${config.promptDetail}

Lütfen tam olarak ${params.sectionCount} adet section üret. Her section'da instruction, content ve correctAnswer olsun.`;

    try {
      const raw: Record<string, unknown> = await generateCreativeMultimodal({
        prompt: userPrompt,
        systemInstruction: SYSTEM_INSTRUCTION,
        schema: buildSchema(),
        temperature: 0.7,
      });

      const sections = (Array.isArray(raw.sections) ? raw.sections : []).map(
        (s: Record<string, unknown>, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          order: i + 1,
          instruction: String(s.instruction ?? ''),
          content: String(s.content ?? ''),
          options: Array.isArray(s.options) ? s.options.map(String) : undefined,
          correctAnswer: s.correctAnswer ? String(s.correctAnswer) : undefined,
          answerArea: { type: 'blank-line' as const, lines: 2 },
        })
      );

      return {
        title: String(raw.title ?? config.activityName),
        generalInstruction: String(raw.generalInstruction ?? ''),
        templateType: config.templateType,
        category: config.category,
        sections,
        pedagogicalNote: String(raw.pedagogicalNote ?? ''),
        difficultyLevel: params.difficulty,
        targetSkills: Array.isArray(raw.targetSkills) ? raw.targetSkills.map(String) : [],
        ageGroup: params.ageGroup,
        profile: params.profile,
        estimatedDuration: Number(raw.estimatedDuration) || sections.length * 3,
        generationMode: 'ai',
        hasAnswerKey: sections.some((s) => s.correctAnswer !== undefined),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Etkinlik üretimi sırasında hata oluştu. Tekrar deneyin.',
        'GENERATION_ERROR',
        500
      );
    }
  };
}

// ── Okuduğunu Anlama (AI) ─────────────────────────────────────────────────

export const generateFiveWOneHQuestions = createAIWorksheetGenerator({
  templateType: 'five-w-one-h-questions',
  category: 'ws-reading-comprehension',
  activityName: '5N1K Soruları',
  promptDetail:
    'Yaş grubuna uygun kısa bir metin (100-200 kelime) üret. Sonra 5N1K sorularını sor. Her sorunun cevabı metinde bulunsun. Öğrenci cevapları yazacak.',
});

export const generateFillInBlanks = createAIWorksheetGenerator({
  templateType: 'fill-in-blanks',
  category: 'ws-reading-comprehension',
  activityName: 'Boşluk Doldurma',
  promptDetail:
    'Konu hakkında cümleler üret. Her cümlede bir anahtar kelimeyi boşluk (___) olarak bırak. correctAnswer alanına doğru kelimeyi yaz.',
});

export const generateEventSequencing = createAIWorksheetGenerator({
  templateType: 'event-sequencing',
  category: 'ws-reading-comprehension',
  activityName: 'Olay Sıralama',
  promptDetail:
    'Kısa bir hikaye/süreç hikayesi yaz. Olayları KARIŞTIRARAK listele. Öğrenci doğru sıraya koyacak. correctAnswer alanına doğru sıra numarasını yaz.',
});

export const generateMainIdea = createAIWorksheetGenerator({
  templateType: 'main-idea',
  category: 'ws-reading-comprehension',
  activityName: 'Ana Fikir Bulma',
  promptDetail:
    'Kısa paragraflar üret. Öğrenci her paragrafın ana fikrini yazacak. correctAnswer alanına ana fikri yaz.',
});

export const generateInference = createAIWorksheetGenerator({
  templateType: 'inference',
  category: 'ws-reading-comprehension',
  activityName: 'Çıkarım Yapma',
  promptDetail:
    'Dolaylı bilgi içeren kısa metinler üret. Öğrenci metinde açıkça yazılmayan ama çıkarılabilecek bilgiyi yazacak.',
});

export const generateCharacterAnalysis = createAIWorksheetGenerator({
  templateType: 'character-analysis',
  category: 'ws-reading-comprehension',
  activityName: 'Karakter Analizi',
  promptDetail:
    'Kısa bir hikaye üret. Öğrenci karakterin fiziksel, kişilik ve davranış özelliklerini yazacak.',
});

export const generateCauseEffectMatching = createAIWorksheetGenerator({
  templateType: 'cause-effect-matching',
  category: 'ws-reading-comprehension',
  activityName: 'Neden-Sonuç Eşleştirme',
  promptDetail:
    'Neden ve sonuç çiftleri üret. Bunları KARIŞTIR. Öğrenci nedenleri sonuçlarla eşleştirecek.',
});

// ── Okuma & Dil (AI destekli olanlar) ──────────────────────────────────────

export const generateSentenceElements = createAIWorksheetGenerator({
  templateType: 'sentence-elements',
  category: 'ws-language-literacy',
  activityName: 'Cümle Ögesi Bulma',
  promptDetail:
    'Cümleler üret. Öğrenci her cümledeki özne, yüklem, nesne, tümleç gibi ögeleri belirleyecek.',
});

// ── Matematik & Mantık (AI destekli olanlar) ───────────────────────────────

export const generateGraphReading = createAIWorksheetGenerator({
  templateType: 'graph-reading',
  category: 'ws-math-logic',
  activityName: 'Grafik Okuma',
  promptDetail:
    'Bir çubuk/pasta grafik için veri seti üret. Grafiği JSON olarak tanımla. Sonra grafik hakkında sorular sor. Cevaplar MUTLAKA grafik verileriyle tutarlı olmalı.',
});

export const generateWordProblem = createAIWorksheetGenerator({
  templateType: 'word-problem',
  category: 'ws-math-logic',
  activityName: 'Problem Çözme',
  promptDetail:
    'Yaş grubuna uygun sözel matematik problemleri üret. Her problemde "Verilen", "İstenen" belli olsun. correctAnswer\'da MUTLAKA doğru sayısal cevabı yaz.',
});
