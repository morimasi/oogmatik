/**
 * OOGMATIK — Birebir Klonlama Servisi (Mod 3)
 *
 * Yüklenen etkinlik görselinin yapısını, stilini ve düzenini
 * mümkün olduğunca birebir kopyalayıp içerikleri yenileyerek
 * yeni bir etkinlik üretir.
 *
 * Selin Arslan: Gemini Vision + structured output. Stil DNA çıkarımı.
 * Bora Demir: TypeScript strict, canvas memory cleanup.
 */

import { analyzeImage, generateWithSchema } from './geminiClient.js';
import { templateEngine } from './templateEngine';
import type {
    ActivityTemplate,
    ExactCloneRequest,
    DeepAnalysisResult,
    StyleTemplate,
    SectionType,
    Difficulty,
} from '../types/ocr-activity';
import type { OCRDetectedType } from '../types/core';
import type { AgeGroup } from '../types/creativeStudio';

// ─── Yardımcı ────────────────────────────────────────────────────────────

const generateId = (prefix: string): string =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

// ─── Derin Analiz Şeması ─────────────────────────────────────────────────

const DEEP_ANALYSIS_SCHEMA = {
    type: 'OBJECT' as const,
    properties: {
        title: { type: 'STRING' as const, description: 'Çalışma kâğıdının başlığı' },
        instructions: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const },
            description: 'Tüm yönerge/talimat metinleri (birebir)',
        },
        questions: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const },
            description: 'Tüm soru metinleri (birebir, sırasıyla)',
        },
        footerText: { type: 'STRING' as const, description: 'Footer/alt bilgi metni' },
        detectedType: {
            type: 'STRING' as const,
            description: 'MATH_WORKSHEET | READING_COMPREHENSION | FILL_IN_THE_BLANK | MATCHING | TRUE_FALSE | MULTIPLE_CHOICE | OTHER',
        },
        columns: { type: 'NUMBER' as const, description: 'Sütun sayısı (1-4)' },
        questionCount: { type: 'NUMBER' as const, description: 'Toplam soru sayısı' },
        hasImages: { type: 'BOOLEAN' as const, description: 'Görsel içeriyor mu?' },
        sectionOrder: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const },
            description: 'Bölüm sırası: header, instruction, question_block, image_area, answer_key, footer',
        },
        blueprint: {
            type: 'STRING' as const,
            description: 'Tam mimari DNA — sütunlar, bloklar, soru formatları, yerleşim mantığı',
        },
        fontDescription: {
            type: 'STRING' as const,
            description: 'Kullanılan font stili açıklaması (büyüklük, kalınlık)',
        },
        colorDescription: {
            type: 'STRING' as const,
            description: 'Renk paleti açıklaması (arka plan, metin, vurgu renkleri)',
        },
        borderDescription: {
            type: 'STRING' as const,
            description: 'Kenarlık/çerçeve stili açıklaması',
        },
        confidence: { type: 'NUMBER' as const, description: 'Analiz güven skoru (0-100)' },
    },
    required: ['title', 'questions', 'detectedType', 'columns', 'questionCount', 'blueprint', 'confidence'],
};

// ─── İçerik Yenileme Şeması ─────────────────────────────────────────────

const CONTENT_REFRESH_SCHEMA = {
    type: 'OBJECT' as const,
    properties: {
        title: { type: 'STRING' as const, description: 'Yeni başlık (aynı konuda farklı)' },
        instruction: { type: 'STRING' as const, description: 'Yeni yönerge' },
        questions: {
            type: 'ARRAY' as const,
            items: {
                type: 'OBJECT' as const,
                properties: {
                    questionText: { type: 'STRING' as const },
                    correctAnswer: { type: 'STRING' as const },
                },
                required: ['questionText', 'correctAnswer'],
            },
            description: 'Yeni sorular (aynı format, farklı veri)',
        },
        pedagogicalNote: { type: 'STRING' as const, description: 'Pedagojik not (min 50 karakter)' },
        targetSkills: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const },
            description: 'Hedef beceriler',
        },
    },
    required: ['title', 'instruction', 'questions', 'pedagogicalNote', 'targetSkills'],
};

// ─── Ana Servis ──────────────────────────────────────────────────────────

interface RefreshedContent {
    title: string;
    instruction: string;
    questions: Array<{ questionText: string; correctAnswer: string }>;
    pedagogicalNote: string;
    targetSkills: string[];
}

export const exactCloneService = {
    /**
     * Görseli derinlemesine analiz eder — metin, stil ve yapıyı çıkarır.
     */
    async deepAnalyze(image: string): Promise<DeepAnalysisResult> {
        const prompt = `
[BİREBİR KLONLAMA MOTORU - Oogmatik EdTech]
Bu çalışma kâğıdını EN İNCE AYRINTI düzeyinde analiz et.

ANALİZ PROTOKOLÜ:
1. METIN ÇIKARIMI: Tüm başlıkları, yönergeleri, soruları ve alt bilgileri BİREBİR çıkar.
2. STİL ANALİZİ: Font stili, büyüklüğü, renk paleti, kenarlık/çerçeve stilini tanımla.
3. YAPI ANALİZİ: Sütun sayısı, bölüm sırası, soru formatı, görsel yerleşimi belirle.
4. MİMARİ DNA: Sayfa hiyerarşisini ve blok yapısını detaylı olarak blueprint'e yaz.

AMAÇ: Bu etkinliği birebir klonlayarak sadece İÇERİĞİ yenileyeceğiz. Yapı ve stil korunacak.
    `;

        const result = await analyzeImage(image, prompt, DEEP_ANALYSIS_SCHEMA);
        const data = result as Record<string, unknown>;

        return {
            texts: {
                title: (data['title'] as string) || 'Başlıksız',
                instructions: (data['instructions'] as string[]) || [],
                questions: (data['questions'] as string[]) || [],
                footerText: data['footerText'] as string | undefined,
            },
            style: this.extractStyleTemplate(data),
            structure: {
                type: ((data['detectedType'] as string) || 'OTHER') as OCRDetectedType,
                columns: (data['columns'] as number) || 1,
                questionCount: (data['questionCount'] as number) || 0,
                hasImages: (data['hasImages'] as boolean) ?? false,
                sectionOrder: ((data['sectionOrder'] as string[]) || ['header', 'instruction', 'question_block', 'footer']) as SectionType[],
            },
            blueprint: (data['blueprint'] as string) || '',
            confidence: (data['confidence'] as number) || 50,
        };
    },

    /**
     * API yanıtından stil şablonu çıkarır.
     */
    extractStyleTemplate(data: Record<string, unknown>): StyleTemplate {
        return {
            fontFamily: 'Lexend',
            fontSize: (data['fontDescription'] as string)?.includes('büyük') ? '16px' : '14px',
            headerStyle: {
                fontWeight: '700',
                textAlign: 'center',
                fontSize: '20px',
            },
            bodyStyle: {
                lineHeight: '1.6',
                letterSpacing: '0.02em',
            },
            borderStyle: (data['borderDescription'] as string) || 'none',
            colorPalette: extractColors(data['colorDescription'] as string),
            iconUsage: false,
        };
    },

    /**
     * İçerik yenileyerek klonlama yapar.
     * Yapı ve stil orijinalden alınır, içerik AI ile yenilenir.
     */
    async cloneWithNewContent(request: ExactCloneRequest): Promise<ActivityTemplate> {
        // 1. Derin analiz
        const analysis = await this.deepAnalyze(request.image);

        // 2. Yeni içerik üret
        const refreshedContent = await this.generateRefreshedContent(
            analysis,
            request.cloneMode,
            request.difficulty
        );

        // 3. ActivityTemplate oluştur
        return this.buildTemplate(analysis, refreshedContent, request);
    },

    /**
     * Küçük varyasyon — sadece sayılar ve kelimeler değişir.
     */
    async minorVariation(request: ExactCloneRequest): Promise<ActivityTemplate> {
        return this.cloneWithNewContent({
            ...request,
            cloneMode: 'minor_variation',
        });
    },

    /**
     * Orijinal analiz verisiyle yeni içerik üretir.
     */
    async generateRefreshedContent(
        analysis: DeepAnalysisResult,
        cloneMode: 'minor_variation' | 'full_content_refresh',
        difficulty?: Difficulty
    ): Promise<RefreshedContent> {
        const modeInstruction = cloneMode === 'minor_variation'
            ? `SADECE sayıları, kelimeleri ve kısa cümleleri değiştir. Soru yapısı ve formatı AYNI kalmalı.
Örnek: "3 + 5 = ?" → "7 + 2 = ?", "elma" → "armut"`
            : `Tamamen YENİ içerik üret. Aynı konuda, aynı zorlukta, ama farklı senaryo ve sorularla.`;

        const prompt = `
[İÇERİK YENİLEME MOTORU - Oogmatik EdTech]
Aşağıdaki etkinliğin yapısını ve stilini KORUYARAK içeriğini yenile.

ORİJİNAL ETKİNLİK:
Başlık: ${analysis.texts.title}
Tür: ${analysis.structure.type}
Soru Sayısı: ${analysis.structure.questionCount}
Orijinal Sorular:
${analysis.texts.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

YÖNERGE:
${modeInstruction}

ZORLUK: ${difficulty || 'Orijinal ile aynı'}

ZORUNLU KURALLAR:
1. pedagogicalNote EN AZ 50 karakter.
2. Soru sayısı orijinal ile AYNI olmalı (${analysis.structure.questionCount} soru).
3. Türkçe içerik.
4. Tanı koyucu dil YASAK.
5. Her sorunun doğru cevabı olmalı.
    `;

        const result = await generateWithSchema(prompt, CONTENT_REFRESH_SCHEMA);
        const data = result as RefreshedContent;

        return {
            title: data.title || analysis.texts.title,
            instruction: data.instruction || 'Aşağıdaki soruları cevaplayınız.',
            questions: data.questions || [],
            pedagogicalNote: data.pedagogicalNote || '',
            targetSkills: data.targetSkills || [],
        };
    },

    /**
     * Analiz + yenilenmis içerikten ActivityTemplate oluşturur.
     */
    buildTemplate(
        analysis: DeepAnalysisResult,
        content: RefreshedContent,
        request: ExactCloneRequest
    ): ActivityTemplate {
        const now = new Date().toISOString();
        const columns = analysis.structure.columns;

        // Bölümleri sırasına göre oluştur
        const sections = analysis.structure.sectionOrder.map((sectionType, index) => {
            let sectionContent = '';

            switch (sectionType) {
                case 'header':
                    sectionContent = content.title;
                    break;
                case 'instruction':
                    sectionContent = content.instruction;
                    break;
                case 'question_block':
                    sectionContent = content.questions
                        .map((q, i) => `<div style="margin-bottom: 10px;"><strong>${i + 1}.</strong> ${q.questionText}</div>`)
                        .join('');
                    break;
                case 'footer':
                    sectionContent = analysis.texts.footerText || '© Oogmatik Eğitim Platformu';
                    break;
                default:
                    sectionContent = '';
            }

            return {
                id: generateId('sec'),
                type: sectionType,
                content: sectionContent,
                position: { row: index, col: 0, span: columns },
                style: analysis.style.bodyStyle,
            };
        });

        const ageGroup: AgeGroup = request.ageGroup || '8-10';

        return {
            id: generateId('tmpl'),
            version: 'v1.0',
            mode: 'exact_clone',
            status: 'draft',
            layout: {
                pageSize: 'A4',
                orientation: 'portrait',
                columns,
                margin: { top: 20, right: 15, bottom: 20, left: 15 },
                gap: 12,
            },
            sections,
            metadata: {
                title: content.title,
                subject: inferSubjectFromType(analysis.structure.type),
                gradeLevel: 4,
                ageGroup,
                difficulty: request.difficulty || 'Orta',
                estimatedDuration: Math.max(5, content.questions.length * 2.5),
                targetSkills: content.targetSkills,
                learningObjectives: [],
                pedagogicalNote: content.pedagogicalNote,
                profile: request.targetProfile,
                productionMode: 'exact_clone',
                sourceBlueprint: analysis.blueprint.substring(0, 200),
            },
            answerKey: content.questions.map((q, i) => ({
                questionId: sections.find((s) => s.type === 'question_block')?.id || generateId('q'),
                questionNumber: i + 1,
                correctAnswer: q.correctAnswer || '',
            })),
            history: [],
            createdAt: now,
            updatedAt: now,
        };
    },
};

// ─── Yardımcı ────────────────────────────────────────────────────────────

function extractColors(colorDescription: string | undefined): string[] {
    if (!colorDescription) return ['#1a1a2e', '#f0f4ff', '#6366f1'];
    // Basit renk çıkarımı — hex kodları varsa al
    const hexMatches = colorDescription.match(/#[0-9a-fA-F]{3,6}/g);
    return hexMatches && hexMatches.length > 0
        ? hexMatches
        : ['#1a1a2e', '#f0f4ff', '#6366f1'];
}

function inferSubjectFromType(type: OCRDetectedType): string {
    switch (type) {
        case 'MATH_WORKSHEET':
            return 'Matematik';
        case 'READING_COMPREHENSION':
            return 'Türkçe';
        case 'FILL_IN_THE_BLANK':
        case 'MATCHING':
        case 'TRUE_FALSE':
        case 'MULTIPLE_CHOICE':
            return 'Genel';
        default:
            return 'Genel';
    }
}
