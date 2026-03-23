import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivityService } from '@/services/generators/ActivityService';
import { ActivityType, GeneratorOptions } from '@/types';

// Mock Registry to avoid real dependencies
vi.mock('../services/generators/registry', () => ({
    ACTIVITY_GENERATOR_REGISTRY: {
        'FIVE_W_ONE_H': {
            ai: vi.fn().mockResolvedValue({ id: 'test' }),
            offline: vi.fn().mockResolvedValue({ id: 'test' })
        }
    }
}));

describe('ActivityService', () => {
    
    const mockOptions: GeneratorOptions = {
        difficulty: 'orta',
        worksheetCount: 1,
        mode: 'ai',
        itemCount: 10
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return a singleton instance', () => {
        const instance1 = ActivityService.getInstance();
        const instance2 = ActivityService.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('should generate content for registered activity', async () => {
        const service = ActivityService.getInstance();
        
        // FIVE_W_ONE_H is mocked in the registry above
        const result = await service.generate(ActivityType.FIVE_W_ONE_H, mockOptions);
        
        expect(result).toBeDefined();
        expect(result.id).toBe('test');
    });

    it('should throw error for unknown activity', async () => {
        const service = ActivityService.getInstance();
        
        await expect(service.generate('UNKNOWN_ACTIVITY' as ActivityType, mockOptions))
            .rejects.toThrow('No generator found');
    });
});
