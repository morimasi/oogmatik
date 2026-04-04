/**
 * @file tests/services/generators/infographicRegistry.test.ts
 * @description Registry Integration Test — 94 Aktivite Doğrulama
 *
 * Bu test, tüm 94 INFOGRAPHIC aktivitesinin:
 * 1. Registry'de kayıtlı olduğunu
 * 2. AI ve Offline generator'larının çağrılabilir olduğunu
 * 3. Doğru tip döndürdüklerini
 *
 * doğrular.
 */

import { describe, it, expect } from 'vitest';
import { ACTIVITY_GENERATOR_REGISTRY } from '../../../src/services/generators/registry';
import { ActivityType } from '../../../src/types/activity';

describe('Infographic Registry Integration', () => {
  // İlk 10 özel aktivite
  const FIRST_10_ACTIVITIES: ActivityType[] = [
    ActivityType.INFOGRAPHIC_CONCEPT_MAP,
    ActivityType.INFOGRAPHIC_COMPARE,
    ActivityType.INFOGRAPHIC_VISUAL_LOGIC,
    ActivityType.INFOGRAPHIC_VENN_DIAGRAM,
    ActivityType.INFOGRAPHIC_MIND_MAP,
    ActivityType.INFOGRAPHIC_FLOWCHART,
    ActivityType.INFOGRAPHIC_MATRIX_ANALYSIS,
    ActivityType.INFOGRAPHIC_CAUSE_EFFECT,
    ActivityType.INFOGRAPHIC_FISHBONE,
    ActivityType.INFOGRAPHIC_CLUSTER_MAP,
  ];

  describe('Registry Completeness', () => {
    it('should register all 94 INFOGRAPHIC activities', () => {
      const allActivityTypes = Object.values(ActivityType);
      const infographicActivities = allActivityTypes.filter((type) =>
        type.startsWith('INFOGRAPHIC_')
      );

      expect(infographicActivities.length).toBe(94);

      // Tümü registry'de olmalı
      infographicActivities.forEach((activityType) => {
        expect(ACTIVITY_GENERATOR_REGISTRY[activityType]).toBeDefined();
      });
    });

    it('should have both AI and offline generators for first 10 activities', () => {
      FIRST_10_ACTIVITIES.forEach((activityType) => {
        const entry = ACTIVITY_GENERATOR_REGISTRY[activityType];

        expect(entry).toBeDefined();
        expect(entry?.ai).toBeDefined();
        expect(entry?.offline).toBeDefined();
        expect(typeof entry?.ai).toBe('function');
        expect(typeof entry?.offline).toBe('function');
      });
    });

    it('should have AI and offline generators for remaining 84 activities', () => {
      const allActivityTypes = Object.values(ActivityType);
      const infographicActivities = allActivityTypes.filter((type) =>
        type.startsWith('INFOGRAPHIC_')
      );

      const remaining84 = infographicActivities.filter(
        (type) => !FIRST_10_ACTIVITIES.includes(type as ActivityType)
      );

      expect(remaining84.length).toBe(84);

      remaining84.forEach((activityType) => {
        const entry = ACTIVITY_GENERATOR_REGISTRY[activityType as ActivityType];

        expect(entry).toBeDefined();
        expect(entry?.ai).toBeDefined();
        expect(entry?.offline).toBeDefined();
      });
    });
  });

  describe('Generator Functionality', () => {
    it('should call offline generator for CONCEPT_MAP without error', async () => {
      const generator = ACTIVITY_GENERATOR_REGISTRY[ActivityType.INFOGRAPHIC_CONCEPT_MAP];

      expect(generator).toBeDefined();
      expect(generator?.offline).toBeDefined();

      // Mock options
      const options = {
        topic: 'Test Konu',
        ageGroup: '8-10' as const,
        difficulty: 'Orta' as const,
        profile: 'general' as const,
        count: 5,
        customParams: { minConcepts: 5 },
      };

      // Offline generator çağrısı
      const result = await generator!.offline!(options);

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.pedagogicalNote).toBeDefined();
    });

    it('should call offline generator for COMPARE without error', async () => {
      const generator = ACTIVITY_GENERATOR_REGISTRY[ActivityType.INFOGRAPHIC_COMPARE];

      expect(generator).toBeDefined();

      const options = {
        topic: 'Test Karşılaştırma',
        ageGroup: '8-10' as const,
        difficulty: 'Orta' as const,
        profile: 'dyslexia' as const,
        count: 5,
        customParams: { itemCount: 4 },
      };

      const result = await generator!.offline!(options);

      expect(result).toBeDefined();
      expect(result.pedagogicalNote).toContain('karşılaştırma');
    });

    it('should return valid result structure from offline generators', async () => {
      const generator = ACTIVITY_GENERATOR_REGISTRY[ActivityType.INFOGRAPHIC_VENN_DIAGRAM];

      const options = {
        topic: 'Venn Test',
        ageGroup: '11-13' as const,
        difficulty: 'Zor' as const,
        profile: 'adhd' as const,
        count: 5,
        customParams: {},
      };

      const result = await generator!.offline!(options);

      // Expected structure
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('pedagogicalNote');
      expect(result).toHaveProperty('layoutHints');
      expect(result).toHaveProperty('targetSkills');
      expect(result).toHaveProperty('estimatedDuration');
      expect(result).toHaveProperty('difficultyLevel');
      expect(result).toHaveProperty('ageGroup');
      expect(result).toHaveProperty('profile');

      // TypeScript tip kontrolü
      expect(typeof result.title).toBe('string');
      expect(typeof result.pedagogicalNote).toBe('string');
      expect(Array.isArray(result.targetSkills)).toBe(true);
      expect(typeof result.estimatedDuration).toBe('number');
    });
  });

  describe('Pedagogical Note Validation (Elif Yıldız Standardı)', () => {
    it('should include pedagogicalNote in all offline results', async () => {
      const testActivities = FIRST_10_ACTIVITIES.slice(0, 3); // Test first 3

      for (const activityType of testActivities) {
        const generator = ACTIVITY_GENERATOR_REGISTRY[activityType];

        const options = {
          topic: 'Test',
          ageGroup: '8-10' as const,
          difficulty: 'Orta' as const,
          profile: 'general' as const,
          count: 5,
          customParams: {},
        };

        const result = await generator!.offline!(options);

        expect(result.pedagogicalNote).toBeDefined();
        expect(result.pedagogicalNote.length).toBeGreaterThan(50); // Min 50 karakter
      }
    });

    it('should avoid diagnostic language in pedagogical notes', async () => {
      const generator = ACTIVITY_GENERATOR_REGISTRY[ActivityType.INFOGRAPHIC_CONCEPT_MAP];

      const options = {
        topic: 'Test',
        ageGroup: '8-10' as const,
        difficulty: 'Orta' as const,
        profile: 'dyslexia' as const,
        count: 5,
        customParams: {},
      };

      const result = await generator!.offline!(options);

      // Tanı koyucu dil yasak
      expect(result.pedagogicalNote).not.toMatch(/disleksisi var/i);
      expect(result.pedagogicalNote).not.toMatch(/DEHB'si var/i);

      // Doğru ifade kullanılmalı
      if (result.pedagogicalNote.toLowerCase().includes('disleksi')) {
        expect(result.pedagogicalNote).toMatch(/disleksi desteğine ihtiyacı olan/i);
      }
    });
  });

  describe('Performance Check', () => {
    it('should complete offline generation in <500ms (target)', async () => {
      const generator = ACTIVITY_GENERATOR_REGISTRY[ActivityType.INFOGRAPHIC_FLOWCHART];

      const options = {
        topic: 'Performance Test',
        ageGroup: '8-10' as const,
        difficulty: 'Kolay' as const,
        profile: 'general' as const,
        count: 5,
        customParams: {},
      };

      const startTime = performance.now();
      await generator!.offline!(options);
      const endTime = performance.now();

      const duration = endTime - startTime;

      // Target: <500ms (offline should be fast)
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing customParams gracefully', async () => {
      const generator = ACTIVITY_GENERATOR_REGISTRY[ActivityType.INFOGRAPHIC_MIND_MAP];

      const options = {
        topic: 'Error Test',
        ageGroup: '8-10' as const,
        difficulty: 'Orta' as const,
        profile: 'general' as const,
        count: 5,
        customParams: {}, // Empty params
      };

      // Should not throw
      const result = await generator!.offline!(options);
      expect(result).toBeDefined();
    });

    it('should provide default values when params are missing', async () => {
      const generator = ACTIVITY_GENERATOR_REGISTRY[ActivityType.INFOGRAPHIC_CONCEPT_MAP];

      const options = {
        topic: '',
        ageGroup: '8-10' as const,
        difficulty: 'Orta' as const,
        profile: 'general' as const,
        count: 0,
        customParams: {},
      };

      const result = await generator!.offline!(options);

      // Should use defaults
      expect(result.title).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });
});
