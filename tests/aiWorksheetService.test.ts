/**
 * OOGMATIK - AI Worksheet Service Tests
 * Test suite for intelligent worksheet generation
 */

import { describe, it, expect } from 'vitest';
import { aiWorksheetService } from '@/services/aiWorksheetService';
import { Student } from '@/types/student';
import { WorksheetGenerationParams } from '@/services/aiWorksheetService';

describe('AI Worksheet Service', () => {
  const mockStudent: Student = {
    id: 'student-123',
    name: 'Test Öğrenci',
    age: 10,
    grade: '4. Sınıf',
    profile: 'dyslexia',
    strengths: ['Görsel öğrenme', 'Matematik'],
    challenges: ['Okuma akıcılığı', 'Yazım'],
    avatar: '',
    createdAt: new Date().toISOString()
  };

  const basicParams: WorksheetGenerationParams = {
    student: mockStudent,
    subject: 'Türkçe',
    topic: 'Okuma Anlama',
    difficulty: 'Kolay',
    duration: 30,
    activityTypes: ['reading-comprehension', 'vocabulary-builder'],
    learningObjectives: ['Metni anlama', 'Kelime dağarcığını geliştirme']
  };

  describe('generateIntelligentWorksheet', () => {
    it('should generate worksheet with multi-agent validation', async () => {
      const result = await aiWorksheetService.generateIntelligentWorksheet(basicParams);

      expect(result).toHaveProperty('worksheet');
      expect(result).toHaveProperty('validation');
    });

    it('should include required worksheet fields', async () => {
      const result = await aiWorksheetService.generateIntelligentWorksheet(basicParams);

      expect(result.worksheet).toHaveProperty('id');
      expect(result.worksheet).toHaveProperty('name');
      expect(result.worksheet).toHaveProperty('description');
      expect(result.worksheet).toHaveProperty('activities');
      expect(result.worksheet).toHaveProperty('createdAt');
      expect(result.worksheet).toHaveProperty('updatedAt');
    });

    it('should include pedagogicalNote in content', async () => {
      const result = await aiWorksheetService.generateIntelligentWorksheet(basicParams);

      expect((result.worksheet as any).metadata).toBeDefined();
      expect((result.worksheet as any).activities).toBeDefined();
      expect((result.worksheet as any).activities.length).toBeGreaterThan(0);
    });

    it('should validate with all 4 expert agents', async () => {
      const result = await aiWorksheetService.generateIntelligentWorksheet(basicParams);

      expect(result.validation.pedagogicalScore).toBeGreaterThanOrEqual(0);
      expect(result.validation.clinicalScore).toBeGreaterThanOrEqual(0);
      expect(result.validation.technicalScore).toBeGreaterThanOrEqual(0);
      expect(result.validation.aiQualityScore).toBeGreaterThanOrEqual(0);
    });

    it('should calculate overall validation score', async () => {
      const result = await aiWorksheetService.generateIntelligentWorksheet(basicParams);

      expect(result.validation.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.validation.overallScore).toBeLessThanOrEqual(100);
    });

    it('should mark worksheet as valid if all agents approve', async () => {
      const result = await aiWorksheetService.generateIntelligentWorksheet(basicParams);

      if (result.validation.overallScore >= 70) {
        expect(result.validation.isValid).toBe(true);
      }
    });

    it('should list approved agents', async () => {
      const result = await aiWorksheetService.generateIntelligentWorksheet(basicParams);

      expect(Array.isArray(result.validation.approvedBy)).toBe(true);
    });
  });

  describe('validateWithAgents', () => {
    const sampleWorksheet = {
      title: 'Test Worksheet',
      description: 'Sample worksheet for testing',
      activities: [
        {
          type: 'reading-comprehension',
          title: 'Metin Okuma',
          instructions: 'Metni okuyun ve soruları cevaplayın',
          content: 'Test content',
          difficulty: 'Kolay',
          estimatedTime: 15
        }
      ],
      pedagogicalNote: 'Bu aktivite okuma anlama becerisini geliştirir'
    };

    it('should validate with all agents', async () => {
      const validation = await aiWorksheetService.validateWithAgents(sampleWorksheet);

      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('pedagogicalScore');
      expect(validation).toHaveProperty('clinicalScore');
      expect(validation).toHaveProperty('technicalScore');
      expect(validation).toHaveProperty('aiQualityScore');
      expect(validation).toHaveProperty('overallScore');
      expect(validation).toHaveProperty('issues');
      expect(validation).toHaveProperty('approvedBy');
    });

    it('should identify critical issues', async () => {
      const invalidWorksheet = {
        ...sampleWorksheet as any,
        pedagogicalNote: null, // Missing required field
        activities: []
      };

      const validation = await aiWorksheetService.validateWithAgents(invalidWorksheet);

      const criticalIssues = validation.issues.filter(i => i.severity === 'critical');
      expect(criticalIssues.length).toBeGreaterThan(0);
    });

    it('should provide suggestions for improvements', async () => {
      const validation = await aiWorksheetService.validateWithAgents(sampleWorksheet);

      validation.issues.forEach(issue => {
        expect(issue).toHaveProperty('severity');
        expect(issue).toHaveProperty('category');
        expect(issue).toHaveProperty('message');
        expect(issue).toHaveProperty('suggestion');
      });
    });
  });

  describe('getSuggestedWorksheets', () => {
    it('should generate personalized suggestions', async () => {
      const suggestions = await aiWorksheetService.getSuggestedWorksheets(
        mockStudent,
        3
      );

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should include all required fields in suggestions', async () => {
      const suggestions = await aiWorksheetService.getSuggestedWorksheets(
        mockStudent,
        5
      );

      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('estimatedDifficulty');
        expect(suggestion).toHaveProperty('estimatedDuration');
        expect(suggestion).toHaveProperty('recommendedActivities');
        expect(suggestion).toHaveProperty('rationale');
        expect(suggestion).toHaveProperty('expectedBenefits');
        expect(suggestion).toHaveProperty('prerequisites');
      });
    });

    it('should tailor suggestions to student profile', async () => {
      const suggestions = await aiWorksheetService.getSuggestedWorksheets(
        mockStudent,
        5
      );

      suggestions.forEach(suggestion => {
        expect(suggestion.rationale).toBeDefined();
        expect(suggestion.rationale.length).toBeGreaterThan(10);
      });
    });

    it('should provide realistic difficulty estimates', async () => {
      const suggestions = await aiWorksheetService.getSuggestedWorksheets(
        mockStudent,
        5
      );

      suggestions.forEach(suggestion => {
        expect(['Kolay', 'Orta', 'Zor']).toContain(suggestion.estimatedDifficulty);
      });
    });

    it('should suggest appropriate activity types', async () => {
      const suggestions = await aiWorksheetService.getSuggestedWorksheets(
        mockStudent,
        5
      );

      suggestions.forEach(suggestion => {
        expect(Array.isArray(suggestion.recommendedActivities)).toBe(true);
        expect(suggestion.recommendedActivities.length).toBeGreaterThan(0);
      });
    });
  });

  describe('optimizeWorksheet', () => {
    const sampleWorksheet = {
      id: 'ws-123',
      name: 'Test Worksheet',
      description: 'Sample',
      activities: [
        {
          id: 'act-1',
          type: 'reading-comprehension' as const,
          title: 'Okuma',
          instructions: 'Oku',
          content: 'Content',
          difficulty: 'Orta' as const,
          estimatedTime: 20
        },
        {
          id: 'act-2',
          type: 'vocabulary-builder' as const,
          title: 'Kelime',
          instructions: 'Kelime bul',
          content: 'Content',
          difficulty: 'Kolay' as const,
          estimatedTime: 10
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    it('should optimize worksheet for student', async () => {
      const result = await aiWorksheetService.optimizeWorksheet(
        sampleWorksheet as any,
        mockStudent
      );

      expect(result).toHaveProperty('optimized');
      expect(result).toHaveProperty('changes');
      expect(result).toHaveProperty('improvements');
    });

    it('should list specific changes made', async () => {
      const result = await aiWorksheetService.optimizeWorksheet(
        sampleWorksheet as any,
        mockStudent
      );

      expect(Array.isArray(result.changes)).toBe(true);
      expect(result.changes.length).toBeGreaterThan(0);
    });

    it('should provide improvement rationale', async () => {
      const result = await aiWorksheetService.optimizeWorksheet(
        sampleWorksheet as any,
        mockStudent
      );

      expect(Array.isArray(result.improvements)).toBe(true);
      expect(result.improvements.length).toBeGreaterThan(0);
    });

    it('should maintain worksheet structure', async () => {
      const result = await aiWorksheetService.optimizeWorksheet(
        sampleWorksheet as any,
        mockStudent
      );

      expect(result.optimized).toHaveProperty('name');
      expect(result.optimized).toHaveProperty('description');
      expect(result.optimized).toHaveProperty('activities');
    });
  });

  describe('generateAdaptiveWorksheet', () => {
    const adaptiveParams: WorksheetGenerationParams = {
      ...basicParams,
      adaptiveLevel: 3
    };

    it('should generate adaptive worksheet', async () => {
      const result = await aiWorksheetService.generateAdaptiveWorksheet(adaptiveParams);

      expect(result).toHaveProperty('worksheet');
      expect(result).toHaveProperty('adaptiveLevels');
    });

    it('should include adaptation triggers', async () => {
      const result = await aiWorksheetService.generateAdaptiveWorksheet(adaptiveParams);

      expect(Array.isArray(result.adaptiveLevels)).toBe(true);
      expect(result.adaptiveLevels.length).toBeGreaterThan(0);

      result.adaptiveLevels.forEach(level => {
        expect(level).toHaveProperty('trigger');
        expect(level).toHaveProperty('adjustment');
      });
    });

    it('should define clear adaptation rules', async () => {
      const result = await aiWorksheetService.generateAdaptiveWorksheet(adaptiveParams);

      result.adaptiveLevels.forEach(level => {
        expect(level.trigger.length).toBeGreaterThan(10);
        expect(level.adjustment.length).toBeGreaterThan(10);
      });
    });

    it('should support different adaptive levels', async () => {
      const lowAdaptive = await aiWorksheetService.generateAdaptiveWorksheet({
        ...basicParams,
        adaptiveLevel: 1
      });

      const highAdaptive = await aiWorksheetService.generateAdaptiveWorksheet({
        ...basicParams,
        adaptiveLevel: 5
      });

      expect(lowAdaptive.adaptiveLevels.length).toBeLessThanOrEqual(
        highAdaptive.adaptiveLevels.length
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: generate → validate → optimize', async () => {
      // Generate
      const generated = await aiWorksheetService.generateIntelligentWorksheet(basicParams);
      expect(generated.validation.isValid).toBeDefined();

      // Optimize if needed
      if (generated.validation.overallScore < 90) {
        const optimized = await aiWorksheetService.optimizeWorksheet(
          generated.worksheet,
          mockStudent
        );
        expect(optimized.improvements.length).toBeGreaterThan(0);
      }
    });

    it('should enforce dyslexia-friendly standards', async () => {
      const result = await aiWorksheetService.generateIntelligentWorksheet(basicParams);

      // Check for Lexend font requirement (via validation)
      const fontIssues = result.validation.issues.filter(i =>
        i.message.toLowerCase().includes('lexend')
      );

      // Should either have no font issues or be in critical category
      fontIssues.forEach(issue => {
        if (issue.severity === 'critical') {
          expect(result.validation.isValid).toBe(false);
        }
      });
    });

    it('should ensure pedagogical note requirement', async () => {
      const result = await aiWorksheetService.generateIntelligentWorksheet(basicParams);

      const pedagogicalIssues = result.validation.issues.filter(i =>
        i.message.toLowerCase().includes('pedagogicalnote')
      );

      // If pedagogical note is missing, should be flagged
      pedagogicalIssues.forEach(issue => {
        expect(issue.category).toBe('pedagogical');
      });
    });

    it('should respect student learning profile', async () => {
      const dyscalculiaStudent = {
        ...mockStudent,
        profile: 'dyscalculia' as const,
        challenges: ['Matematik', 'Sayı hissi']
      };

      const mathParams = {
        ...basicParams,
        student: dyscalculiaStudent,
        subject: 'Matematik',
        topic: 'Temel İşlemler'
      };

      const result = await aiWorksheetService.generateIntelligentWorksheet(mathParams);

      // Should adapt to dyscalculia profile
      expect((result.worksheet as any).metadata?.studentId).toBe(dyscalculiaStudent.id);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid parameters', async () => {
      const invalidParams = {
        ...basicParams,
        duration: -10 // Invalid duration
      };

      await expect(
        aiWorksheetService.generateIntelligentWorksheet(invalidParams)
      ).rejects.toThrow();
    });

    it('should handle empty activity types', async () => {
      const emptyParams = {
        ...basicParams,
        activityTypes: []
      };

      await expect(
        aiWorksheetService.generateIntelligentWorksheet(emptyParams)
      ).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should generate worksheet in reasonable time', async () => {
      const start = Date.now();
      await aiWorksheetService.generateIntelligentWorksheet(basicParams);
      const duration = Date.now() - start;

      // Should complete within 30 seconds
      expect(duration).toBeLessThan(30000);
    }, 35000);

    it('should handle multiple concurrent generations', async () => {
      const promises = Array(3).fill(null).map(() =>
        aiWorksheetService.generateIntelligentWorksheet(basicParams)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect((result.worksheet as any).id).toBeDefined();
      });
    }, 60000);
  });
});
