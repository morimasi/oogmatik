/**
 * Template Engine Tests
 */

import { describe, it, expect } from 'vitest';
import { templateEngine } from '../services/templateEngine';
import type { OCRBlueprint } from '../types/core';
import type { ActivityTemplate } from '../types/ocr-activity';

describe('Template Engine - extractTemplate', () => {
    const mockBlueprint: OCRBlueprint = {
        title: 'Toplama İşlemleri',
        detectedType: 'MATH_WORKSHEET',
        worksheetBlueprint: '2 sütun, 10 soru, toplama işlemleri\nYönerge: Aşağıdaki işlemleri yapınız.',
        layoutHints: { columns: 2, hasImages: false, questionCount: 10 },
    };

    it('should extract template from blueprint', () => {
        const template = templateEngine.extractTemplate(mockBlueprint);

        expect(template).toBeDefined();
        expect(template.id).toMatch(/^tmpl_/);
        expect(template.version).toBe('v1.0');
        expect(template.mode).toBe('architecture_clone');
        expect(template.status).toBe('draft');
        expect(template.layout.columns).toBe(2);
        expect(template.layout.pageSize).toBe('A4');
        expect(template.metadata.title).toBe('Toplama İşlemleri');
        expect(template.metadata.subject).toBe('Matematik');
    });

    it('should create header, instruction, question blocks, answer key and footer sections', () => {
        const template = templateEngine.extractTemplate(mockBlueprint);

        const sectionTypes = template.sections.map((s) => s.type);
        expect(sectionTypes).toContain('header');
        expect(sectionTypes).toContain('instruction');
        expect(sectionTypes).toContain('question_block');
        expect(sectionTypes).toContain('answer_key');
        expect(sectionTypes).toContain('footer');
    });

    it('should handle blueprint without layoutHints', () => {
        const simpleBlueprint: OCRBlueprint = {
            title: 'Basit Test',
            detectedType: 'OTHER',
            worksheetBlueprint: 'Basit içerik',
        };

        const template = templateEngine.extractTemplate(simpleBlueprint);
        expect(template.layout.columns).toBe(1);
        expect(template.metadata.subject).toBe('Genel');
    });
});

describe('Template Engine - applyData', () => {
    it('should update metadata', () => {
        const blueprint: OCRBlueprint = {
            title: 'Test', detectedType: 'OTHER', worksheetBlueprint: 'test',
        };
        const template = templateEngine.extractTemplate(blueprint);

        const updated = templateEngine.applyData(template, {
            metadata: { title: 'Güncellenmiş Başlık', subject: 'Türkçe' },
        });

        expect(updated.metadata.title).toBe('Güncellenmiş Başlık');
        expect(updated.metadata.subject).toBe('Türkçe');
        // updatedAt geçerli ISO string olmalı
        expect(updated.updatedAt).toBeDefined();
        expect(new Date(updated.updatedAt).toISOString()).toBe(updated.updatedAt);
    });

    it('should update section contents by id', () => {
        const blueprint: OCRBlueprint = {
            title: 'Test', detectedType: 'OTHER', worksheetBlueprint: 'test',
        };
        const template = templateEngine.extractTemplate(blueprint);
        const headerId = template.sections.find((s) => s.type === 'header')?.id;

        const updated = templateEngine.applyData(template, {
            sections: [{ id: headerId, content: 'Yeni Başlık' }],
        });

        const header = updated.sections.find((s) => s.type === 'header');
        expect(header?.content).toBe('Yeni Başlık');
    });
});

describe('Template Engine - renderToHTML', () => {
    it('should render valid HTML', () => {
        const blueprint: OCRBlueprint = {
            title: 'HTML Test', detectedType: 'MATH_WORKSHEET', worksheetBlueprint: 'test',
        };
        const template = templateEngine.extractTemplate(blueprint);
        template.metadata.pedagogicalNote = 'Bu aktivite test amaçlıdır ve doğrulama için kullanılır.';

        const html = templateEngine.renderToHTML(template);

        expect(html).toContain('a4-page');
        expect(html).toContain('Lexend');
        expect(html).toContain('HTML Test');
        expect(html).toContain('Pedagojik Not');
    });

    it('should escape HTML in content', () => {
        const blueprint: OCRBlueprint = {
            title: '<script>alert("xss")</script>',
            detectedType: 'OTHER',
            worksheetBlueprint: 'test',
        };
        const template = templateEngine.extractTemplate(blueprint);
        const html = templateEngine.renderToHTML(template);

        expect(html).not.toContain('<script>');
        expect(html).toContain('&lt;script&gt;');
    });
});

describe('Template Engine - validateTemplate', () => {
    it('should return valid for complete template', () => {
        const blueprint: OCRBlueprint = {
            title: 'Tam Şablon', detectedType: 'MATH_WORKSHEET', worksheetBlueprint: 'test',
            layoutHints: { columns: 1, hasImages: false, questionCount: 5 },
        };
        const template = templateEngine.extractTemplate(blueprint);
        template.metadata.pedagogicalNote = 'Bu aktivite toplama işlemini pekiştirmek için tasarlanmıştır.';
        template.metadata.targetSkills = ['Toplama', 'Sayı algısı'];
        template.metadata.learningObjectives = ['Toplama işlemi yapabilme'];

        const result = templateEngine.validateTemplate(template);

        expect(result.isValid).toBe(true);
        expect(result.qualityScore).toBeGreaterThan(80);
    });

    it('should fail for missing pedagogicalNote', () => {
        const blueprint: OCRBlueprint = {
            title: 'Eksik', detectedType: 'OTHER', worksheetBlueprint: 'test',
        };
        const template = templateEngine.extractTemplate(blueprint);

        const result = templateEngine.validateTemplate(template);

        expect(result.errors.some((e) => e.field === 'metadata.pedagogicalNote')).toBe(true);
    });

    it('should warn for missing targetSkills', () => {
        const blueprint: OCRBlueprint = {
            title: 'Test', detectedType: 'OTHER', worksheetBlueprint: 'test',
        };
        const template = templateEngine.extractTemplate(blueprint);
        template.metadata.pedagogicalNote = 'Yeterince uzun bir pedagojik not yazıyoruz burada.';

        const result = templateEngine.validateTemplate(template);

        expect(result.warnings.some((w) => w.includes('Hedef beceriler'))).toBe(true);
    });

    it('should never return negative qualityScore', () => {
        const template: ActivityTemplate = {
            id: 'test', version: 'v1', mode: 'prompt_generation', status: 'draft',
            layout: { pageSize: 'A4', orientation: 'portrait', columns: 1, margin: { top: 0, right: 0, bottom: 0, left: 0 }, gap: 0 },
            sections: [],
            metadata: {
                title: '', subject: '', gradeLevel: 0, ageGroup: '5-7',
                difficulty: 'Invalid' as any, estimatedDuration: 0,
                targetSkills: [], learningObjectives: [], pedagogicalNote: '',
                productionMode: 'prompt_generation',
            },
            history: [], createdAt: '', updatedAt: '',
        };

        const result = templateEngine.validateTemplate(template);
        expect(result.qualityScore).toBeGreaterThanOrEqual(0);
    });
});

describe('Template Engine - generateAnswerKey', () => {
    it('should create answer key entries for question blocks', () => {
        const blueprint: OCRBlueprint = {
            title: 'Test', detectedType: 'MATH_WORKSHEET', worksheetBlueprint: 'test',
            layoutHints: { columns: 1, hasImages: false, questionCount: 5 },
        };
        const template = templateEngine.extractTemplate(blueprint);

        const answerKey = templateEngine.generateAnswerKey(template);

        expect(answerKey.length).toBe(5);
        expect(answerKey[0].questionNumber).toBe(1);
        expect(answerKey[4].questionNumber).toBe(5);
    });
});
