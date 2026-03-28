/**
 * OOGMATIK — Şablon Motoru (Template Engine)
 *
 * JSON tabanlı, genişletilebilir etkinlik şablon sistemi.
 * Blueprint'ten yapısal şablon çıkarır, veri uygular ve A4 HTML'e render eder.
 *
 * Bora Demir: TypeScript strict, any yasak, AppError standardı.
 * Elif Yıldız: pedagogicalNote her şablonda zorunlu.
 */

import type {
    ActivityTemplate,
    TemplateLayout,
    TemplateSection,
    ActivityMetadata,
    AnswerKeyItem,
    TemplateValidationResult,
    TemplateValidationError,
    SectionType,
    Difficulty,
    ProductionMode,
} from '../types/ocr-activity';
import type { OCRBlueprint, OCRDetectedType } from '../types/core';

// ─── Varsayılan Değerler ─────────────────────────────────────────────────

const DEFAULT_LAYOUT: TemplateLayout = {
    pageSize: 'A4',
    orientation: 'portrait',
    columns: 1,
    margin: { top: 20, right: 15, bottom: 20, left: 15 },
    gap: 12,
};

const _SECTION_TYPE_MAP: Record<string, SectionType> = {
    MATH_WORKSHEET: 'question_block',
    READING_COMPREHENSION: 'question_block',
    FILL_IN_THE_BLANK: 'question_block',
    MATCHING: 'question_block',
    TRUE_FALSE: 'question_block',
    MULTIPLE_CHOICE: 'question_block',
    OTHER: 'question_block',
};

// ─── ID Üretici ──────────────────────────────────────────────────────────

const generateId = (prefix: string): string =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

// ─── Şablon Motoru ───────────────────────────────────────────────────────

export const templateEngine = {
    /**
     * Blueprint'ten yapısal ActivityTemplate çıkarır.
     * OCR analiz sonucundaki blueprint verisini JSON şablona dönüştürür.
     */
    extractTemplate(
        blueprint: OCRBlueprint,
        mode: ProductionMode = 'architecture_clone'
    ): ActivityTemplate {
        const now = new Date().toISOString();
        const columns = blueprint.layoutHints?.columns ?? 1;
        const questionCount = blueprint.layoutHints?.questionCount ?? 0;

        // Blueprint'ten bölümler oluştur
        const sections: TemplateSection[] = [];

        // Başlık bölümü
        sections.push({
            id: generateId('sec'),
            type: 'header',
            content: blueprint.title || 'Etkinlik',
            position: { row: 0, col: 0, span: columns },
        });

        // Yönerge bölümü — blueprint içinden çıkarılır
        sections.push({
            id: generateId('sec'),
            type: 'instruction',
            content: extractInstruction(blueprint.worksheetBlueprint),
            position: { row: 1, col: 0, span: columns },
        });

        // Soru blokları
        for (let i = 0; i < Math.max(questionCount, 1); i++) {
            sections.push({
                id: generateId('sec'),
                type: 'question_block',
                content: '',
                position: { row: 2 + Math.floor(i / columns), col: i % columns },
                questionType: mapDetectedTypeToQuestionType(blueprint.detectedType),
            });
        }

        // Cevap anahtarı alanı
        sections.push({
            id: generateId('sec'),
            type: 'answer_key',
            content: '',
            position: { row: 100, col: 0, span: columns },
        });

        // Footer
        sections.push({
            id: generateId('sec'),
            type: 'footer',
            content: '© Oogmatik Eğitim Platformu',
            position: { row: 101, col: 0, span: columns },
        });

        const template: ActivityTemplate = {
            id: generateId('tmpl'),
            version: 'v1.0',
            mode,
            status: 'draft',
            layout: {
                ...DEFAULT_LAYOUT,
                columns,
            },
            sections,
            metadata: {
                title: blueprint.title || 'Başlıksız Etkinlik',
                subject: inferSubject(blueprint.detectedType),
                gradeLevel: 4,
                ageGroup: '8-10',
                difficulty: 'Orta',
                estimatedDuration: estimateDuration(questionCount),
                targetSkills: [],
                learningObjectives: [],
                pedagogicalNote: '',
                productionMode: mode,
                sourceBlueprint: blueprint.worksheetBlueprint.substring(0, 200),
            },
            history: [],
            createdAt: now,
            updatedAt: now,
        };

        return template;
    },

    /**
     * Şablona yeni veri uygular.
     * Mevcut şablon yapısını koruyarak içeriği günceller.
     */
    applyData(
        template: ActivityTemplate,
        data: Record<string, unknown>
    ): ActivityTemplate {
        const updatedTemplate = { ...template, updatedAt: new Date().toISOString() };

        // Metadata güncellemesi
        if (data['metadata'] && typeof data['metadata'] === 'object') {
            updatedTemplate.metadata = {
                ...updatedTemplate.metadata,
                ...(data['metadata'] as Partial<ActivityMetadata>),
            };
        }

        // Bölüm içerikleri güncellemesi
        if (data['sections'] && Array.isArray(data['sections'])) {
            const sectionUpdates = data['sections'] as Array<{ id: string; content: string }>;
            updatedTemplate.sections = updatedTemplate.sections.map((section) => {
                const update = sectionUpdates.find((s) => s.id === section.id);
                return update ? { ...section, content: update.content } : section;
            });
        }

        // Cevap anahtarı
        if (data['answerKey'] && Array.isArray(data['answerKey'])) {
            updatedTemplate.answerKey = data['answerKey'] as AnswerKeyItem[];
        }

        return updatedTemplate;
    },

    /**
     * Şablonu A4 uyumlu HTML'e render eder.
     * Lexend font kullanılır (disleksi uyumluluğu).
     */
    renderToHTML(template: ActivityTemplate): string {
        const { layout, sections, metadata } = template;
        const isPortrait = layout.orientation === 'portrait';
        const pageWidth = isPortrait ? 210 : 297;
        const pageHeight = isPortrait ? 297 : 210;

        const sortedSections = [...sections].sort((a, b) => {
            if (a.position.row !== b.position.row) return a.position.row - b.position.row;
            return a.position.col - b.position.col;
        });

        let html = `
<div class="a4-page" style="
  width: ${pageWidth}mm;
  min-height: ${pageHeight}mm;
  padding: ${layout.margin.top}mm ${layout.margin.right}mm ${layout.margin.bottom}mm ${layout.margin.left}mm;
  font-family: 'Lexend', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #1a1a2e;
  background: #ffffff;
  box-sizing: border-box;
">`;

        for (const section of sortedSections) {
            html += renderSection(section, layout.columns);
        }

        // Pedagojik not (öğretmen için — basılı çıktıda görünür)
        if (metadata.pedagogicalNote) {
            html += `
  <div style="
    margin-top: 16px;
    padding: 12px;
    background: #f0f4ff;
    border-left: 4px solid #6366f1;
    border-radius: 0 8px 8px 0;
    font-size: 12px;
    color: #4b5563;
  ">
    <strong>📝 Pedagojik Not:</strong> ${escapeHtml(metadata.pedagogicalNote)}
  </div>`;
        }

        html += '\n</div>';
        return html;
    },

    /**
     * Şablon validasyonu — zorunlu alanları ve yapısal bütünlüğü kontrol eder.
     */
    validateTemplate(template: ActivityTemplate): TemplateValidationResult {
        const errors: TemplateValidationError[] = [];
        const warnings: string[] = [];
        let qualityScore = 100;

        // Zorunlu metadata kontrolleri
        if (!template.metadata.title || template.metadata.title.length < 3) {
            errors.push({ field: 'metadata.title', message: 'Başlık en az 3 karakter olmalıdır.', severity: 'error' });
            qualityScore -= 15;
        }

        if (!template.metadata.pedagogicalNote || template.metadata.pedagogicalNote.length < 20) {
            errors.push({ field: 'metadata.pedagogicalNote', message: 'Pedagojik not en az 20 karakter olmalıdır.', severity: 'error' });
            qualityScore -= 30;
        }

        if (template.metadata.targetSkills.length === 0) {
            warnings.push('Hedef beceriler belirtilmemiş.');
            qualityScore -= 10;
        }

        if (template.metadata.learningObjectives.length === 0) {
            warnings.push('Öğrenme hedefleri belirtilmemiş.');
            qualityScore -= 10;
        }

        // Bölüm kontrolleri
        const hasHeader = template.sections.some((s) => s.type === 'header');
        const hasQuestions = template.sections.some((s) => s.type === 'question_block');

        if (!hasHeader) {
            warnings.push('Başlık bölümü eksik.');
            qualityScore -= 5;
        }

        if (!hasQuestions) {
            errors.push({ field: 'sections', message: 'En az bir soru bloğu olmalıdır.', severity: 'error' });
            qualityScore -= 20;
        }

        // Zorluk seviyesi kontrolü
        const validDifficulties: Difficulty[] = ['Kolay', 'Orta', 'Zor'];
        if (!validDifficulties.includes(template.metadata.difficulty)) {
            errors.push({
                field: 'metadata.difficulty',
                message: `Geçersiz zorluk seviyesi: ${template.metadata.difficulty}`,
                severity: 'error',
            });
            qualityScore -= 10;
        }

        return {
            isValid: errors.filter((e) => e.severity === 'error').length === 0,
            errors,
            warnings,
            qualityScore: Math.max(0, qualityScore),
        };
    },

    /**
     * Cevap anahtarı üretir (placeholder — AI ile doldurulur).
     */
    generateAnswerKey(template: ActivityTemplate): AnswerKeyItem[] {
        const questionSections = template.sections.filter((s) => s.type === 'question_block');
        return questionSections.map((section, index) => ({
            questionId: section.id,
            questionNumber: index + 1,
            correctAnswer: '',
            explanation: '',
        }));
    },
};

// ─── Yardımcı Fonksiyonlar ───────────────────────────────────────────────

function extractInstruction(blueprint: string): string {
    const lines = blueprint.split('\n').map((l) => l.trim()).filter(Boolean);
    // İlk birkaç satırdan yönerge çıkar
    for (const line of lines.slice(0, 5)) {
        if (
            line.toLowerCase().includes('yönerge') ||
            line.toLowerCase().includes('talimat') ||
            line.toLowerCase().includes('aşağıdaki')
        ) {
            return line;
        }
    }
    return 'Aşağıdaki soruları cevaplayınız.';
}

function mapDetectedTypeToQuestionType(
    type: OCRDetectedType
): 'multiple_choice' | 'fill_in_the_blank' | 'matching' | 'true_false' | 'open_ended' {
    switch (type) {
        case 'MULTIPLE_CHOICE':
            return 'multiple_choice';
        case 'FILL_IN_THE_BLANK':
            return 'fill_in_the_blank';
        case 'MATCHING':
            return 'matching';
        case 'TRUE_FALSE':
            return 'true_false';
        default:
            return 'open_ended';
    }
}

function inferSubject(type: OCRDetectedType): string {
    switch (type) {
        case 'MATH_WORKSHEET':
            return 'Matematik';
        case 'READING_COMPREHENSION':
            return 'Türkçe';
        default:
            return 'Genel';
    }
}

function estimateDuration(questionCount: number): number {
    // Her soru için ortalama 2-3 dakika
    return Math.max(5, Math.min(45, questionCount * 2.5));
}

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderSection(section: TemplateSection, totalColumns: number): string {
    const span = section.position.span ?? 1;
    const widthPercent = (span / totalColumns) * 100;

    const baseStyle = `
    width: ${widthPercent}%;
    box-sizing: border-box;
    padding: 6px 0;
  `;

    switch (section.type) {
        case 'header':
            return `
  <div style="${baseStyle}">
    <h1 style="font-size: 20px; font-weight: 700; text-align: center; margin: 0 0 8px 0; color: #1e1b4b;">
      ${escapeHtml(section.content)}
    </h1>
  </div>`;

        case 'instruction':
            return `
  <div style="${baseStyle}">
    <p style="font-size: 14px; color: #374151; margin: 0 0 12px 0; padding: 8px 12px; background: #fef3c7; border-radius: 8px;">
      📋 ${escapeHtml(section.content)}
    </p>
  </div>`;

        case 'question_block':
            return `
  <div style="${baseStyle} padding: 8px 0;">
    <div style="padding: 8px 0; border-bottom: 1px dashed #e5e7eb;">
      ${section.content || '<em style="color:#9ca3af;">Soru içeriği üretilecek</em>'}
    </div>
  </div>`;

        case 'answer_key':
            return section.content
                ? `
  <div style="${baseStyle} margin-top: 16px; padding: 12px; background: #ecfdf5; border-radius: 8px;">
    <strong>✅ Cevap Anahtarı:</strong>
    ${section.content}
  </div>`
                : '';

        case 'footer':
            return `
  <div style="${baseStyle} text-align: center; font-size: 10px; color: #9ca3af; margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 8px;">
    ${escapeHtml(section.content)}
  </div>`;

        case 'divider':
            return `<div style="${baseStyle}"><hr style="border: none; border-top: 2px solid #e5e7eb; margin: 8px 0;" /></div>`;

        default:
            return `<div style="${baseStyle}">${section.content}</div>`;
    }
}
