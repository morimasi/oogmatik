import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSuperStudioContent } from '../src/services/generators/superStudioGenerator';
import { GenerationMode, SuperStudioDifficulty } from '../src/types/superStudio';
import { AppError } from '../src/utils/AppError';

// Mock geminiClient
vi.mock('../src/services/geminiClient', () => ({
    generateWithSchema: vi.fn()
}));

// Mock cacheService (browser-only)
vi.mock('../src/services/cacheService', () => ({
    default: {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(undefined)
    }
}));

import { generateWithSchema } from '../src/services/geminiClient';

describe('Super Türkçe Generator - Basic Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Fast Mode (Offline)', () => {
        it('should generate mock content for okuma-anlama template', async () => {
            const result = await generateSuperStudioContent({
                templates: ['okuma-anlama'],
                settings: {},
                mode: 'fast',
                grade: '4. Sınıf',
                difficulty: 'Kolay',
                studentId: null
            });

            expect(result).toHaveLength(1);
            expect(result[0].templateId).toBe('okuma-anlama');
            expect(result[0].pages[0].content).toContain('[HIZLI MOD');
            expect(result[0].pages[0].content).toContain('4. Sınıf');
            expect(result[0].pages[0].content).toContain('Kolay');
            expect(result[0].pages[0].pedagogicalNote).toBeDefined();
        });

        it('should generate mock content for multiple templates', async () => {
            const result = await generateSuperStudioContent({
                templates: ['okuma-anlama', 'dilbilgisi', 'mantik-muhakeme'],
                settings: {},
                mode: 'fast',
                grade: '5. Sınıf',
                difficulty: 'Orta',
                studentId: null
            });

            expect(result).toHaveLength(3);
            expect(result.map(r => r.templateId)).toEqual(['okuma-anlama', 'dilbilgisi', 'mantik-muhakeme']);
            result.forEach(r => {
                expect(r.pages[0].pedagogicalNote).toBeDefined();
            });
        });

        it('should generate mock content for new templates (yazim-kurallari, soz-varligi, hece-ses)', async () => {
            const result = await generateSuperStudioContent({
                templates: ['yazim-kurallari', 'soz-varligi', 'hece-ses'],
                settings: {},
                mode: 'fast',
                grade: '3. Sınıf',
                difficulty: 'Kolay',
                studentId: null
            });

            expect(result).toHaveLength(3);
            expect(result.map(r => r.templateId)).toEqual(['yazim-kurallari', 'soz-varligi', 'hece-ses']);
        });
    });

    describe('AI Mode', () => {
        beforeEach(() => {
            vi.mocked(generateWithSchema).mockResolvedValue({
                title: 'Test Okuma Parçası',
                text: 'Bir varmış bir yokmuş...',
                questions: [
                    { question: 'Kimdir?', answer: 'Ali' },
                    { question: 'Nedir?', answer: 'Okul' },
                    { question: 'Nerededir?', answer: 'İstanbul' }
                ],
                pedagogicalNote: 'Bu aktivite okuma anlama becerisini geliştirmek için tasarlandı.'
            });
        });

        it('should call Gemini API for okuma-anlama template', async () => {
            const result = await generateSuperStudioContent({
                templates: ['okuma-anlama'],
                settings: { 'okuma-anlama': { length: 'kisa', questionCount: 3 } },
                mode: 'ai',
                grade: '5. Sınıf',
                difficulty: 'Orta',
                studentId: 'user123'
            });

            expect(result).toHaveLength(1);
            expect(result[0].templateId).toBe('okuma-anlama');
            expect(result[0].pages[0].title).toBe('Test Okuma Parçası');
            expect(result[0].pages[0].content).toContain('Bir varmış bir yokmuş...');
            expect(result[0].pages[0].content).toContain('Kimdir?');
            expect(result[0].pages[0].pedagogicalNote).toBe('Bu aktivite okuma anlama becerisini geliştirmek için tasarlandı.');
            expect(generateWithSchema).toHaveBeenCalledTimes(1);
        });

        it('should format yazim-kurallari template correctly', async () => {
            vi.mocked(generateWithSchema).mockResolvedValue({
                title: 'Büyük Harf Kuralları',
                topic: 'Büyük-Küçük Harf Kullanımı',
                exercises: [
                    {
                        sentence: 'ali okula gitti.',
                        question: 'Bu cümlede hangi kelime büyük harfle başlamalı?',
                        correctAnswer: 'Ali',
                        rule: 'Özel isimler büyük harfle başlar'
                    }
                ],
                pedagogicalNote: 'Yazım kuralları aktivitesi',
                visualHints: ['Özel isimleri renkli vurgulayın']
            });

            const result = await generateSuperStudioContent({
                templates: ['yazim-kurallari'],
                settings: {},
                mode: 'ai',
                grade: '3. Sınıf',
                difficulty: 'Kolay',
                studentId: 'user456'
            });

            expect(result[0].pages[0].content).toContain('Büyük-Küçük Harf Kullanımı');
            expect(result[0].pages[0].content).toContain('ali okula gitti.');
            expect(result[0].pages[0].content).toContain('Ali');
            expect(result[0].pages[0].content).toContain('Görsel İpuçları');
        });

        it('should format soz-varligi template correctly', async () => {
            vi.mocked(generateWithSchema).mockResolvedValue({
                title: 'Deyimler',
                items: [
                    {
                        phrase: 'Eli kulağında olmak',
                        meaning: 'Çok yakın zamanda olmak',
                        exampleSentence: 'Düğün elimiz kulağımızda.',
                        visualHint: 'El kulağa dokunuyor'
                    }
                ],
                pedagogicalNote: 'Deyim öğretimi aktivitesi'
            });

            const result = await generateSuperStudioContent({
                templates: ['soz-varligi'],
                settings: {},
                mode: 'ai',
                grade: '6. Sınıf',
                difficulty: 'Orta',
                studentId: 'user789'
            });

            expect(result[0].pages[0].content).toContain('Eli kulağında olmak');
            expect(result[0].pages[0].content).toContain('Çok yakın zamanda olmak');
            expect(result[0].pages[0].content).toContain('Düğün elimiz kulağımızda');
        });

        it('should format hece-ses template correctly', async () => {
            vi.mocked(generateWithSchema).mockResolvedValue({
                title: 'Hece Ayrıştırma',
                activities: [
                    {
                        word: 'kalem',
                        syllables: ['ka', 'lem'],
                        soundEvent: 'Vurgulu hece: lem',
                        colorHint: 'İkinci hece büyük: kaLEM'
                    }
                ],
                pedagogicalNote: 'Hece ayrıştırma aktivitesi'
            });

            const result = await generateSuperStudioContent({
                templates: ['hece-ses'],
                settings: {},
                mode: 'ai',
                grade: '2. Sınıf',
                difficulty: 'Kolay',
                studentId: 'user000'
            });

            expect(result[0].pages[0].content).toContain('kalem → ka-lem');
            expect(result[0].pages[0].content).toContain('Vurgulu hece');
        });
    });

    describe('Error Handling', () => {
        it('should throw error when no templates selected', async () => {
            await expect(
                generateSuperStudioContent({
                    templates: [],
                    settings: {},
                    mode: 'ai',
                    grade: null,
                    difficulty: 'Orta',
                    studentId: null
                })
            ).rejects.toThrow('En az bir şablon seçilmelidir');
        });

        it('should throw AppError with correct code', async () => {
            try {
                await generateSuperStudioContent({
                    templates: [],
                    settings: {},
                    mode: 'ai',
                    grade: null,
                    difficulty: 'Orta',
                    studentId: null
                });
            } catch (error) {
                expect(error).toBeInstanceOf(AppError);
                expect((error as AppError).code).toBe('NO_TEMPLATE_SELECTED');
                expect((error as AppError).httpStatus).toBe(400);
            }
        });
    });

    describe('Prompt Building', () => {
        it('should include grade and difficulty in prompt', async () => {
            vi.mocked(generateWithSchema).mockResolvedValue({
                title: 'Test',
                text: 'Test metin',
                questions: [{ question: 'Test?', answer: 'Test' }],
                pedagogicalNote: 'Test not'
            });

            await generateSuperStudioContent({
                templates: ['okuma-anlama'],
                settings: {},
                mode: 'ai',
                grade: '7. Sınıf',
                difficulty: 'Zor',
                studentId: 'test'
            });

            const callArgs = vi.mocked(generateWithSchema).mock.calls[0];
            const prompt = callArgs[0];

            expect(prompt).toContain('7. Sınıf');
            expect(prompt).toContain('Zor');
        });
    });
});
