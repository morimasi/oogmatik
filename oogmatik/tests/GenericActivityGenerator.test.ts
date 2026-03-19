import { describe, it, expect, vi } from 'vitest';
import { GenericActivityGenerator } from '../services/generators/core/GenericActivityGenerator';
import { GeneratorMode } from '../services/generators/core/types';
import { GeneratorOptions } from '../types';

describe('GenericActivityGenerator', () => {
    
    const mockOptions: GeneratorOptions = {
        difficulty: 'orta',
        worksheetCount: 1,
        mode: 'ai',
        itemCount: 10
    };

    const mockAIData = { result: 'AI Data' };
    const mockOfflineData = { result: 'Offline Data' };

    const mockAIFunction = vi.fn().mockResolvedValue(mockAIData);
    const mockOfflineFunction = vi.fn().mockResolvedValue(mockOfflineData);

    it('should call AI function when mode is AI', async () => {
        const generator = new GenericActivityGenerator(
            GeneratorMode.AI,
            mockAIFunction,
            mockOfflineFunction
        );

        const result = await generator.generate(mockOptions);

        expect(mockAIFunction).toHaveBeenCalledWith(mockOptions);
        expect(result).toEqual(mockAIData);
    });

    it('should call Offline function when mode is OFFLINE', async () => {
        const generator = new GenericActivityGenerator(
            GeneratorMode.OFFLINE,
            mockAIFunction,
            mockOfflineFunction
        );

        const result = await generator.generate(mockOptions);

        expect(mockOfflineFunction).toHaveBeenCalledWith(mockOptions);
        expect(result).toEqual(mockOfflineData);
    });

    it('should fallback to Offline if AI function is missing in AI mode', async () => {
        const generator = new GenericActivityGenerator(
            GeneratorMode.AI,
            undefined,
            mockOfflineFunction
        );

        const result = await generator.generate(mockOptions);

        expect(mockOfflineFunction).toHaveBeenCalledWith(mockOptions);
        expect(result).toEqual(mockOfflineData);
    });

    it('should fallback to AI if Offline function is missing in OFFLINE mode', async () => {
        const generator = new GenericActivityGenerator(
            GeneratorMode.OFFLINE,
            mockAIFunction,
            undefined
        );

        const result = await generator.generate(mockOptions);

        expect(mockAIFunction).toHaveBeenCalledWith(mockOptions);
        expect(result).toEqual(mockAIData);
    });
});
