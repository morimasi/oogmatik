import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FiveWOneHGenerator } from '@/services/generators/FiveWOneHGenerator';
import { GeneratorMode } from '@/services/generators/core/types';
import { GeneratorOptions, FiveWOneHData } from '@/types';

// Mock Dependencies
vi.mock('../services/generators/fiveWOneH', () => ({
    generateFiveWOneHFromAI: vi.fn()
}));

vi.mock('../services/offlineGenerators/fiveWOneH', () => ({
    generateOfflineFiveWOneH: vi.fn()
}));

// Import mocked functions to assert calls
import { generateFiveWOneHFromAI } from '@/services/generators/fiveWOneH';
import { generateOfflineFiveWOneH } from '@/services/offlineGenerators/fiveWOneH';

describe('FiveWOneHGenerator', () => {

    const mockOptions: GeneratorOptions = {
        difficulty: 'orta',
        worksheetCount: 1
    };

    const mockAIData: FiveWOneHData = {
        title: 'AI Story',
        instruction: 'Oku',
        content: { title: 'T', text: 'T', paragraphs: [] },
        questions: [],
        settings: {
            difficulty: 'orta',
            topic: 'Genel',
            textLength: 'kısa',
            syllableColoring: false,
            fontFamily: 'OpenDyslexic',
            questionStyle: 'test_and_open'
        }
    };

    const mockOfflineData: FiveWOneHData[] = [{
        title: 'Offline Story',
        instruction: 'Oku',
        content: { title: 'T', text: 'T', paragraphs: [] },
        questions: [],
        settings: {
            difficulty: 'orta',
            topic: 'Genel',
            textLength: 'kısa',
            syllableColoring: false,
            fontFamily: 'OpenDyslexic',
            questionStyle: 'test_and_open'
        }
    }];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call AI generator when mode is AI', async () => {
        // Setup mock return
        (generateFiveWOneHFromAI as any).mockResolvedValue(mockAIData);

        const generator = new FiveWOneHGenerator(GeneratorMode.AI);
        const result = await generator.generate(mockOptions);

        expect(generateFiveWOneHFromAI).toHaveBeenCalledWith(mockOptions);
        expect(generateOfflineFiveWOneH).not.toHaveBeenCalled();
        expect(result).toEqual(mockAIData);
    });

    it('should call Offline generator when mode is OFFLINE', async () => {
        // Setup mock return
        (generateOfflineFiveWOneH as any).mockResolvedValue(mockOfflineData);

        const generator = new FiveWOneHGenerator(GeneratorMode.OFFLINE);
        const result = await generator.generate(mockOptions);

        expect(generateOfflineFiveWOneH).toHaveBeenCalledWith(mockOptions);
        expect(generateFiveWOneHFromAI).not.toHaveBeenCalled();
        expect(result).toEqual(mockOfflineData);
    });
});
