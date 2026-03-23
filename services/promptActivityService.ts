/**
 * OOGMATIK — Prompt Tabanlı Etkinlik Üretim Servisi (Mod 2)
 *
 * Kullanıcının doğal dil prompt'undan sıfırdan etkinlik üretir.
 * Premium kütüphaneden ilham alır, birebir kopyalamaz.
 *
 * Selin Arslan: Gemini 2.5 Flash sabit. Structured output. Hallucination guard.
 * Elif Yıldız: pedagogicalNote zorunlu. ZPD uyumlu zorluk kalibrasyonu.
 */

import { generateWithSchema } from './geminiClient.js';
import { templateLibrary } from './templateLibrary';
import { templateEngine } from './templateEngine';
import type {
    ActivityTemplate,
    PromptGenerationRequest,
    PromptAnalysis,
    QuestionType,
    Difficulty,
} from '../types/ocr-activity';
import type { AgeGroup } from '../types/creativeStudio';

// ─── Yardımcı Fonksiyonlar ───────────────────────────────────────────────

const generateId = (prefix: string): string =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

/** Sınıf düzeyinden yaş grubunu çıkar */
function gradeToAgeGroup(grade: number): AgeGroup {
    if (grade <= 2) return '5-7';
    if (grade <= 5) return '8-10';
    if (grade <= 7) return '11-13';
    return '14+';
}

/** Hızlı mod için varsayılan parametreler */
function getQuickDefaults(grade: number): Partial<PromptGenerationRequest> {
    return {
        difficulty: 'Orta' as Difficulty,
        questionTypes: ['fill_in_the_blank', 'multiple_choice'] as QuestionType[],
        questionCount: 10,
        estimatedDuration: 20,
        includeAnswerKey: true,
        includeImages: false,
        mode: 'fast' as const,
    };
}

// ─── Prompt Analiz Şeması ────────────────────────────────────────────────

const PROMPT_ANALYSIS_SCHEMA = {
    type: 'OBJECT' as const,
    properties: {
        detectedSubject: {
            type: 'STRING' as const,
            description: 'Tespit edilen ders/konu alanı (Matematik, Türkçe, Fen Bilimleri, vs.)',
        },
        detectedGradeLevel: {
            type: 'NUMBER' as const,
            description: 'Tespit edilen sınıf düzeyi (1-8)',
        },
        detectedObjectives: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const },
            description: 'Tespit edilen öğretim hedefleri',
        },
        suggestedQuestionTypes: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const },
            description: 'Önerilen soru tipleri (multiple_choice, fill_in_the_blank, matching, true_false, open_ended, ordering)',
        },
        suggestedDifficulty: {
            type: 'STRING' as const,
            description: 'Önerilen zorluk seviyesi: Kolay | Orta | Zor',
        },
        suggestedDuration: {
            type: 'NUMBER' as const,
            description: 'Önerilen süre (dakika)',
        },
        suggestedImageUsage: {
            type: 'BOOLEAN' as const,
            description: 'Görsel kullanılmalı mı?',
        },
        confidence: {
            type: 'NUMBER' as const,
            description: 'Analiz güven skoru (0-100)',
        },
    },
    required: [
        'detectedSubject',
        'detectedGradeLevel',
        'detectedObjectives',
        'suggestedQuestionTypes',
        'suggestedDifficulty',
        'suggestedDuration',
        'confidence',
    ],
};

// ─── Etkinlik Üretim Şeması ─────────────────────────────────────────────

const ACTIVITY_GENERATION_SCHEMA = {
    type: 'OBJECT' as const,
    properties: {
        title: { type: 'STRING' as const, description: 'Etkinlik başlığı (Türkçe)' },
        instruction: {
            type: 'STRING' as const,
            description: 'Öğrenciye yönelik yönerge (Türkçe, açık ve net)',
        },
        questions: {
            type: 'ARRAY' as const,
            items: {
                type: 'OBJECT' as const,
                properties: {
                    questionNumber: { type: 'NUMBER' as const },
                    questionText: { type: 'STRING' as const },
                    questionType: { type: 'STRING' as const },
                    options: {
                        type: 'ARRAY' as const,
                        items: { type: 'STRING' as const },
                        description: 'Çoktan seçmeli sorular için şıklar',
                    },
                    correctAnswer: { type: 'STRING' as const, description: 'Doğru cevap' },
                    explanation: { type: 'STRING' as const, description: 'Cevap açıklaması' },
                },
                required: ['questionNumber', 'questionText', 'questionType', 'correctAnswer'],
            },
        },
        pedagogicalNote: {
            type: 'STRING' as const,
            description: 'Öğretmene yönelik pedagojik not (minimum 50 karakter, ZPD bağlamında açıklama)',
        },
        targetSkills: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const },
            description: 'Hedeflenen beceriler',
        },
        learningObjectives: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const },
            description: 'Öğrenme hedefleri (MEB kazanım formatında)',
        },
    },
    required: ['title', 'instruction', 'questions', 'pedagogicalNote', 'targetSkills', 'learningObjectives'],
};

// ─── Ana Servis ──────────────────────────────────────────────────────────

interface GeneratedActivity {
    title: string;
    instruction: string;
    questions: Array<{
        questionNumber: number;
        questionText: string;
        questionType: string;
        options?: string[];
        correctAnswer: string;
        explanation?: string;
    }>;
    pedagogicalNote: string;
    targetSkills: string[];
    learningObjectives: string[];
}

export const promptActivityService = {
    /**
     * Prompt'u analiz ederek metadata çıkarır.
     * AI ile prompt'un konu, sınıf, soru tipi, zorluk vb. bilgilerini belirler.
     */
    async analyzePrompt(prompt: string): Promise<PromptAnalysis> {
        const analysisPrompt = `
[PROMPT ANALİZ MOTORU - Oogmatik EdTech]
Aşağıdaki öğretmen/kullanıcı isteğini analiz et ve etkinlik üretimi için gerekli parametreleri çıkar.

KULLANICI İSTEĞİ:
"${prompt}"

KURALLAR:
1. Türkiye MEB müfredatına uygun sınıf düzeyi belirle (1-8).
2. Konu alanını net olarak belirle (Matematik, Türkçe, Fen Bilimleri, Sosyal Bilgiler, İngilizce, vb.).
3. İstek belirsizse makul varsayımlar yap ama düşük confidence ver.
4. Soru tiplerini öner (multiple_choice, fill_in_the_blank, matching, true_false, open_ended, ordering).
5. Zorluk seviyesi: Kolay, Orta veya Zor.
6. Süre tahmini: dakika cinsinden (5-45 arası).
    `;

        const result = await generateWithSchema(analysisPrompt, PROMPT_ANALYSIS_SCHEMA);
        const data = result as Record<string, unknown>;

        return {
            detectedSubject: (data['detectedSubject'] as string) || 'Genel',
            detectedGradeLevel: (data['detectedGradeLevel'] as number) || 4,
            detectedObjectives: (data['detectedObjectives'] as string[]) || [],
            suggestedQuestionTypes: ((data['suggestedQuestionTypes'] as string[]) || []) as QuestionType[],
            suggestedDifficulty: ((data['suggestedDifficulty'] as string) || 'Orta') as Difficulty,
            suggestedDuration: (data['suggestedDuration'] as number) || 20,
            suggestedImageUsage: (data['suggestedImageUsage'] as boolean) ?? false,
            confidence: (data['confidence'] as number) || 50,
        };
    },

    /**
     * Sıfırdan etkinlik üretir.
     * Premium kütüphaneden ilham alarak AI ile tam etkinlik oluşturur.
     */
    async generateFromPrompt(request: PromptGenerationRequest): Promise<ActivityTemplate> {
        // Kütüphaneden ilham şablonu bul
        const inspirationTemplate = templateLibrary.autoSelectTemplate(
            request.prompt,
            request.gradeLevel
        );

        const inspirationContext = inspirationTemplate
            ? `\nİLHAM ŞABLONU (kopyalama değil, yapısal referans):
- Şablon: ${inspirationTemplate.name}
- Soru tipleri: ${inspirationTemplate.questionTypes.join(', ')}
- Yapı: ${inspirationTemplate.structure.columns} sütun, ${inspirationTemplate.structure.questionCount} soru
- Hedef beceriler: ${inspirationTemplate.targetSkills.join(', ')}`
            : '';

        const profileContext = request.profile
            ? `\nÖĞRENCİ PROFİLİ: ${request.profile} — Bu profile uygun zorluk ve format ayarları uygula.`
            : '';

        const generationPrompt = `
[ETKİNLİK ÜRETME MOTORU - Oogmatik EdTech]
Aşağıdaki talebe göre A4 çalışma kâğıdına uygun yeni bir etkinlik üret.

KULLANICI PROMPT'U:
"${request.prompt}"

PARAMETRELER:
- Sınıf Düzeyi: ${request.gradeLevel}. sınıf
- Konu: ${request.subject}
- Zorluk: ${request.difficulty}
- Soru Sayısı: ${request.questionCount ?? 10}
- Soru Tipleri: ${request.questionTypes.join(', ')}
- Tahmini Süre: ${request.estimatedDuration ?? 20} dakika
- Cevap Anahtarı: ${request.includeAnswerKey ? 'Evet' : 'Hayır'}
- Görsel Kullan: ${request.includeImages ? 'Evet' : 'Hayır'}
${inspirationContext}
${profileContext}

ZORUNLU KURALLAR:
1. pedagogicalNote EN AZ 50 karakter olmalı — "neden bu etkinlik" açıklaması.
2. Türkiye MEB müfredatıyla uyumlu içerik.
3. Tanı koyucu dil YASAK ("disleksisi var" değil, "disleksi desteğine ihtiyacı var").
4. Her sorunun doğru cevabı ve açıklaması olmalı.
5. Lexend font uyumlu, disleksi dostu format.
6. Türkçe — tüm içerik Türkçe olmalı.
    `;

        const result = await generateWithSchema(generationPrompt, ACTIVITY_GENERATION_SCHEMA);
        const data = result as GeneratedActivity;

        // ActivityTemplate'e dönüştür
        const now = new Date().toISOString();
        const ageGroup = gradeToAgeGroup(request.gradeLevel);

        const questionSections = (data.questions || []).map((q, index) => {
            let content = `<div class="question" style="margin-bottom: 12px;">
  <strong>${q.questionNumber || index + 1}.</strong> ${q.questionText || ''}`;

            if (q.options && q.options.length > 0) {
                content += '\n<div style="margin-left: 20px; margin-top: 6px;">';
                const labels = ['A', 'B', 'C', 'D', 'E'];
                q.options.forEach((opt, i) => {
                    content += `\n  <div>${labels[i] || String.fromCharCode(65 + i)}) ${opt}</div>`;
                });
                content += '\n</div>';
            }

            content += '\n</div>';

            return {
                id: generateId('sec'),
                type: 'question_block' as const,
                content,
                position: { row: 2 + index, col: 0 },
                questionType: (q.questionType as QuestionType) || 'open_ended',
            };
        });

        const template: ActivityTemplate = {
            id: generateId('tmpl'),
            version: 'v1.0',
            mode: 'prompt_generation',
            status: 'draft',
            layout: {
                pageSize: 'A4',
                orientation: 'portrait',
                columns: inspirationTemplate?.structure.columns ?? 1,
                margin: { top: 20, right: 15, bottom: 20, left: 15 },
                gap: 12,
            },
            sections: [
                {
                    id: generateId('sec'),
                    type: 'header',
                    content: data.title || 'Yeni Etkinlik',
                    position: { row: 0, col: 0 },
                },
                {
                    id: generateId('sec'),
                    type: 'instruction',
                    content: data.instruction || 'Aşağıdaki soruları cevaplayınız.',
                    position: { row: 1, col: 0 },
                },
                ...questionSections,
            ],
            metadata: {
                title: data.title || 'Yeni Etkinlik',
                subject: request.subject,
                gradeLevel: request.gradeLevel,
                ageGroup,
                difficulty: request.difficulty,
                estimatedDuration: request.estimatedDuration ?? 20,
                targetSkills: data.targetSkills || [],
                learningObjectives: data.learningObjectives || [],
                pedagogicalNote: data.pedagogicalNote || '',
                profile: request.profile,
                productionMode: 'prompt_generation',
            },
            answerKey: request.includeAnswerKey
                ? (data.questions || []).map((q, i) => ({
                    questionId: questionSections[i]?.id || generateId('q'),
                    questionNumber: q.questionNumber || i + 1,
                    correctAnswer: q.correctAnswer || '',
                    explanation: q.explanation,
                }))
                : undefined,
            history: [],
            createdAt: now,
            updatedAt: now,
        };

        // Validasyon
        const validation = templateEngine.validateTemplate(template);
        if (!validation.isValid) {
            console.warn('[PromptActivityService] Validasyon uyarıları:', validation.errors);
        }

        return template;
    },

    /**
     * Hızlı mod — minimum parametre ile hızlı üretim.
     */
    async quickGenerate(prompt: string, gradeLevel: number): Promise<ActivityTemplate> {
        // Önce prompt'u analiz et
        const analysis = await this.analyzePrompt(prompt);

        // Varsayılan parametrelerle üret
        const defaults = getQuickDefaults(gradeLevel);

        return this.generateFromPrompt({
            prompt,
            gradeLevel: analysis.detectedGradeLevel || gradeLevel,
            subject: analysis.detectedSubject || 'Genel',
            questionTypes: (analysis.suggestedQuestionTypes.length > 0
                ? analysis.suggestedQuestionTypes
                : defaults.questionTypes) as QuestionType[],
            difficulty: analysis.suggestedDifficulty || (defaults.difficulty as Difficulty),
            questionCount: defaults.questionCount,
            estimatedDuration: analysis.suggestedDuration || defaults.estimatedDuration,
            includeAnswerKey: true,
            includeImages: analysis.suggestedImageUsage ?? false,
            mode: 'fast',
        });
    },
};
