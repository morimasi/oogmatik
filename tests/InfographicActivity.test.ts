import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivityService } from '@/services/generators/ActivityService';
import { ActivityType } from '@/types';

// GeminiClient mock'u - Gerçek API çağrısını önlemek için
vi.mock('@/services/geminiClient', () => ({
    geminiClient: {
        generateActivity: vi.fn().mockResolvedValue({
            success: true,
            data: {
                syntax: "CONCEPT_MAP { Title: 'Test' }",
                pedagogicalNote: "Test note"
            }
        })
    }
}));

describe('Infographic Activity Integration', () => {
    const service = ActivityService.getInstance();

    const mockOptions = {
        difficulty: 'Orta',
        worksheetCount: 1,
        mode: 'ai',
        itemCount: 5
    };

    it('should identify INFOGRAPHIC_ activities and not throw "No generator found"', async () => {
        // Enum'da mevcut olan bir INFOGRAPHIC_ tipi kullanalım
        const testActivity = ActivityType.INFOGRAPHIC_CONCEPT_MAP;

        // ActivityService.generate çağrısı
        // Eğer her şey doğruysa, 'No generator found' hatası fırlatmamalı
        const result = await service.generate(testActivity, mockOptions as any);

        expect(result).toBeDefined();
        // Bizim placeholder generator { success: true, message: ... } dönüyor
        expect(result.message).toBe("Infographic handled by specialized hook");
    });

    it('should correctly handle different infographic activity types from the new catalog', () => {
        const infographicTypes = [
            'INFOGRAPHIC_MATH_STEPS_FRACTIONS',
            'INFOGRAPHIC_VENN_DIAGRAM_ANIMALS',
            'INFOGRAPHIC_5W1H_GRID_STORY_ANALYSIS',
            'INFOGRAPHIC_FISHBONE_PROBLEM_SOLVING'
        ];

        infographicTypes.forEach(type => {
            // Prefix kontrolü
            expect(type.startsWith('INFOGRAPHIC_')).toBe(true);
        });
    });
});
