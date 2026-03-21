/**
 * Turkish AI Integration Service Tests
 *
 * Türkçe modül AI entegrasyonunun kapsamlı testleri
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { turkishAIIntegrationService } from '../services/turkishAIIntegrationService';
import type { TurkishActivityParams, TurkishContentType } from '../services/turkishAIIntegrationService';
import { agentService } from '../services/agentService';
import { aiWorksheetService } from '../services/aiWorksheetService';

// Mock services
vi.mock('../services/agentService');
vi.mock('../services/aiWorksheetService');

describe('Turkish AI Integration Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTurkishContent', () => {
    it('should generate Turkish content with 4-agent validation', async () => {
      // Mock agent service responses
      vi.mocked(agentService.createTask).mockResolvedValue({
        id: 'task-1',
        agentRole: 'ozel-ogrenme-uzmani',
        description: 'Test task',
        priority: 'normal',
        status: 'pending',
        createdAt: new Date(),
        context: {}
      });

      vi.mocked(agentService.executeTask).mockResolvedValue({
        result: { content: 'Test Turkish content', quality: 'high' },
        taskId: 'task-1'
      });

      const params: TurkishActivityParams = {
        contentType: 'okuma_anlama',
        grade: 5,
        objective: 'Metni anlama ve yorumlama',
        difficulty: 'Orta'
      };

      const result = await turkishAIIntegrationService.generateTurkishContent(params);

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('validation');
      expect(result.validation.isValid).toBeDefined();
      expect(result.validation.pedagogicalScore).toBeGreaterThanOrEqual(0);
      expect(result.validation.clinicalScore).toBeGreaterThanOrEqual(0);
      expect(result.validation.technicalScore).toBeGreaterThanOrEqual(0);
      expect(result.validation.aiQualityScore).toBeGreaterThanOrEqual(0);
    });

    it('should validate all Turkish content types', async () => {
      vi.mocked(agentService.createTask).mockResolvedValue({
        id: 'task-1',
        agentRole: 'ozel-ogrenme-uzmani',
        description: 'Test task',
        priority: 'normal',
        status: 'pending',
        createdAt: new Date(),
        context: {}
      });

      vi.mocked(agentService.executeTask).mockResolvedValue({
        result: { content: 'Test content' },
        taskId: 'task-1'
      });

      const contentTypes: TurkishContentType[] = [
        'okuma_anlama',
        'mantik_muhakeme',
        'dil_bilgisi',
        'yazim_noktalama',
        'soz_varligi',
        'ses_olaylari'
      ];

      for (const contentType of contentTypes) {
        const params: TurkishActivityParams = {
          contentType,
          grade: 6,
          objective: 'Test objective',
          difficulty: 'Kolay'
        };

        const result = await turkishAIIntegrationService.generateTurkishContent(params);
        expect(result.validation.feedback).toHaveLength(4); // 4 agents
      }
    });

    it('should include pedagogical note in generated content', async () => {
      vi.mocked(agentService.createTask).mockResolvedValue({
        id: 'task-1',
        agentRole: 'ozel-ogrenme-uzmani',
        description: 'Test task',
        priority: 'normal',
        status: 'pending',
        createdAt: new Date(),
        context: {}
      });

      vi.mocked(agentService.executeTask).mockResolvedValue({
        result: {
          content: 'Test content',
          pedagogicalNote: 'Bu aktivite öğrencinin okuma anlama becerisini geliştirir'
        },
        taskId: 'task-1'
      });

      const params: TurkishActivityParams = {
        contentType: 'okuma_anlama',
        grade: 4,
        objective: 'Ana fikri bulma',
        difficulty: 'Kolay'
      };

      const result = await turkishAIIntegrationService.generateTurkishContent(params);
      expect(result.content).toBeDefined();
    });
  });

  describe('generateTurkishWorksheet', () => {
    it('should generate Turkish worksheet with multi-agent validation', async () => {
      vi.mocked(aiWorksheetService.generateIntelligentWorksheet).mockResolvedValue({
        worksheet: {
          id: 'ws-1',
          title: 'Test Worksheet',
          description: 'Test Turkish worksheet',
          subject: 'Türkçe',
          gradeLevel: 5,
          difficulty: 'Orta',
          activities: [],
          createdAt: new Date(),
          lastModified: new Date()
        },
        validation: {
          isValid: true,
          pedagogicalScore: 85,
          clinicalScore: 88,
          technicalScore: 90,
          aiQualityScore: 87,
          overallScore: 87.5,
          feedback: [
            { agent: 'ozel-ogrenme-uzmani', score: 85, comments: ['Good'] },
            { agent: 'ozel-egitim-uzmani', score: 88, comments: ['Good'] },
            { agent: 'yazilim-muhendisi', score: 90, comments: ['Good'] },
            { agent: 'ai-muhendisi', score: 87, comments: ['Good'] }
          ]
        }
      });

      const params: TurkishActivityParams = {
        contentType: 'dil_bilgisi',
        grade: 6,
        objective: 'İsimleri tanıma',
        difficulty: 'Orta'
      };

      const result = await turkishAIIntegrationService.generateTurkishWorksheet(params);

      expect(result.worksheet).toBeDefined();
      expect(result.worksheet.subject).toBe('Türkçe');
      expect(result.validation.isValid).toBe(true);
      expect(result.validation.overallScore).toBeGreaterThan(80);
    });

    it('should adapt worksheet to student profile', async () => {
      const studentProfile = {
        id: 'student-1',
        name: 'Test Student',
        learningDisability: 'dyslexia' as const,
        gradeLevel: 5,
        strengths: ['görsel öğrenme'],
        weaknesses: ['hızlı okuma']
      };

      vi.mocked(aiWorksheetService.generateIntelligentWorksheet).mockResolvedValue({
        worksheet: {
          id: 'ws-1',
          title: 'Adapted Worksheet',
          description: 'Dyslexia-friendly worksheet',
          subject: 'Türkçe',
          gradeLevel: 5,
          difficulty: 'Kolay',
          activities: [],
          createdAt: new Date(),
          lastModified: new Date()
        },
        validation: {
          isValid: true,
          pedagogicalScore: 90,
          clinicalScore: 92,
          technicalScore: 88,
          aiQualityScore: 89,
          overallScore: 89.75,
          feedback: []
        }
      });

      const params: TurkishActivityParams = {
        contentType: 'okuma_anlama',
        grade: 5,
        objective: 'Metni anlama',
        difficulty: 'Kolay',
        studentProfile
      };

      const result = await turkishAIIntegrationService.generateTurkishWorksheet(params);

      expect(result.worksheet).toBeDefined();
      expect(aiWorksheetService.generateIntelligentWorksheet).toHaveBeenCalledWith(
        expect.objectContaining({
          studentProfile: expect.objectContaining({
            learningDisability: 'dyslexia'
          })
        })
      );
    });

    it('should use correct activity count per content type', async () => {
      vi.mocked(aiWorksheetService.generateIntelligentWorksheet).mockResolvedValue({
        worksheet: {
          id: 'ws-1',
          title: 'Test',
          description: 'Test',
          subject: 'Türkçe',
          gradeLevel: 5,
          difficulty: 'Orta',
          activities: [],
          createdAt: new Date(),
          lastModified: new Date()
        },
        validation: {
          isValid: true,
          pedagogicalScore: 85,
          clinicalScore: 85,
          technicalScore: 85,
          aiQualityScore: 85,
          overallScore: 85,
          feedback: []
        }
      });

      const contentTypeCounts: Record<TurkishContentType, number> = {
        okuma_anlama: 5,
        mantik_muhakeme: 4,
        dil_bilgisi: 6,
        yazim_noktalama: 8,
        soz_varligi: 10,
        ses_olaylari: 8
      };

      for (const [contentType, expectedCount] of Object.entries(contentTypeCounts)) {
        const params: TurkishActivityParams = {
          contentType: contentType as TurkishContentType,
          grade: 5,
          objective: 'Test',
          difficulty: 'Orta'
        };

        await turkishAIIntegrationService.generateTurkishWorksheet(params);

        expect(aiWorksheetService.generateIntelligentWorksheet).toHaveBeenCalledWith(
          expect.objectContaining({
            activityCount: expectedCount
          })
        );
      }
    });
  });

  describe('validateTurkishContent', () => {
    it('should validate Turkish content with all 4 agents', async () => {
      vi.mocked(agentService.coordinateAgents).mockResolvedValue({
        result: {
          validation: {
            isValid: true,
            scores: {
              pedagogy: 85,
              clinical: 88,
              technical: 90,
              aiQuality: 87
            }
          }
        }
      });

      const content = {
        title: 'Test Turkish Content',
        activities: ['Activity 1', 'Activity 2']
      };

      const validation = await turkishAIIntegrationService.validateTurkishContent(
        content,
        'okuma_anlama',
        5
      );

      expect(validation.isValid).toBe(true);
      expect(validation.feedback).toBeDefined();
      expect(agentService.coordinateAgents).toHaveBeenCalledWith(
        'Türkçe içeriği çok-ajan validasyonu',
        ['ozel-ogrenme-uzmani', 'ozel-egitim-uzmani', 'yazilim-muhendisi', 'ai-muhendisi'],
        expect.objectContaining({
          content,
          contentType: 'okuma_anlama',
          grade: 5
        })
      );
    });

    it('should detect invalid Turkish content', async () => {
      vi.mocked(agentService.coordinateAgents).mockResolvedValue({
        error: 'Validation failed: Content does not meet MEB standards'
      });

      const content = {
        title: 'Invalid Content',
        activities: []
      };

      const validation = await turkishAIIntegrationService.validateTurkishContent(
        content,
        'dil_bilgisi',
        6
      );

      expect(validation.isValid).toBe(false);
      expect(validation.improvements).toBeDefined();
    });
  });

  describe('optimizeTurkishContent', () => {
    it('should optimize Turkish content to reach target score', async () => {
      // Initial validation (low score)
      vi.mocked(agentService.coordinateAgents).mockResolvedValueOnce({
        result: { validation: { isValid: false, overallScore: 60 } }
      });

      // Optimization task
      vi.mocked(agentService.createTask).mockResolvedValue({
        id: 'opt-task-1',
        agentRole: 'ai-muhendisi',
        description: 'Optimize content',
        priority: 'high',
        status: 'pending',
        createdAt: new Date(),
        context: {}
      });

      vi.mocked(agentService.executeTask).mockResolvedValue({
        result: { optimizedContent: 'Better content', improvements: ['Added examples'] },
        taskId: 'opt-task-1'
      });

      // Final validation (high score)
      vi.mocked(agentService.coordinateAgents).mockResolvedValueOnce({
        result: { validation: { isValid: true, overallScore: 88 } }
      });

      const content = { title: 'Needs improvement', activities: [] };
      const result = await turkishAIIntegrationService.optimizeTurkishContent(
        content,
        'okuma_anlama',
        85
      );

      expect(result.optimizedContent).toBeDefined();
      expect(result.scoreImprovement).toBeGreaterThan(0);
      expect(result.improvements).toBeDefined();
    });

    it('should skip optimization if content already meets target', async () => {
      vi.mocked(agentService.coordinateAgents).mockResolvedValue({
        result: { validation: { isValid: true, overallScore: 90 } }
      });

      const content = { title: 'Already good', activities: [] };
      const result = await turkishAIIntegrationService.optimizeTurkishContent(
        content,
        'dil_bilgisi',
        85
      );

      expect(result.scoreImprovement).toBe(0);
      expect(result.improvements).toContain('İçerik zaten hedef skora sahip');
      expect(agentService.createTask).not.toHaveBeenCalled();
    });
  });

  describe('Helper Functions', () => {
    it('should build correct Turkish prompts', () => {
      const prompt = turkishAIIntegrationService.buildTurkishPrompt(
        'okuma_anlama',
        5,
        'Ana fikri bulma',
        'Orta'
      );

      expect(prompt).toContain('MEB 5. sınıf');
      expect(prompt).toContain('Okuma Anlama');
      expect(prompt).toContain('Ana fikri bulma');
      expect(prompt).toContain('Orta');
      expect(prompt).toContain('Disleksi dostu');
      expect(prompt).toContain('ZPD uyumu');
    });

    it('should return correct content type names', () => {
      expect(turkishAIIntegrationService.getContentTypeName('okuma_anlama')).toBe(
        'Okuma Anlama ve Yorumlama'
      );
      expect(turkishAIIntegrationService.getContentTypeName('dil_bilgisi')).toBe(
        'Dil Bilgisi ve Anlatım Bozuklukları'
      );
      expect(turkishAIIntegrationService.getContentTypeName('ses_olaylari')).toBe(
        'Hece ve Ses Olayları'
      );
    });

    it('should map grades to correct age groups', () => {
      expect(turkishAIIntegrationService.getAgeGroup(1)).toBe('5-7');
      expect(turkishAIIntegrationService.getAgeGroup(3)).toBe('5-7');
      expect(turkishAIIntegrationService.getAgeGroup(4)).toBe('8-10');
      expect(turkishAIIntegrationService.getAgeGroup(5)).toBe('8-10');
      expect(turkishAIIntegrationService.getAgeGroup(6)).toBe('11-13');
      expect(turkishAIIntegrationService.getAgeGroup(8)).toBe('11-13');
      expect(turkishAIIntegrationService.getAgeGroup(9)).toBe('14+');
    });

    it('should return correct default activity counts', () => {
      expect(turkishAIIntegrationService.getDefaultActivityCount('okuma_anlama')).toBe(5);
      expect(turkishAIIntegrationService.getDefaultActivityCount('mantik_muhakeme')).toBe(4);
      expect(turkishAIIntegrationService.getDefaultActivityCount('dil_bilgisi')).toBe(6);
      expect(turkishAIIntegrationService.getDefaultActivityCount('yazim_noktalama')).toBe(8);
      expect(turkishAIIntegrationService.getDefaultActivityCount('soz_varligi')).toBe(10);
      expect(turkishAIIntegrationService.getDefaultActivityCount('ses_olaylari')).toBe(8);
    });
  });

  describe('MEB Standards Compliance', () => {
    it('should ensure MEB curriculum alignment', async () => {
      vi.mocked(agentService.createTask).mockResolvedValue({
        id: 'task-1',
        agentRole: 'ozel-egitim-uzmani',
        description: 'MEB check',
        priority: 'high',
        status: 'pending',
        createdAt: new Date(),
        context: {}
      });

      vi.mocked(agentService.executeTask).mockResolvedValue({
        result: { mebCompliant: true, standards: ['T5.1.1', 'T5.1.2'] },
        taskId: 'task-1'
      });

      const params: TurkishActivityParams = {
        contentType: 'okuma_anlama',
        grade: 5,
        objective: 'MEB T5.1.1 - Ana fikri bulma',
        difficulty: 'Orta'
      };

      const result = await turkishAIIntegrationService.generateTurkishContent(params);

      // Verify Dr. Ahmet Kaya (clinical expert) validated MEB compliance
      expect(agentService.createTask).toHaveBeenCalledWith(
        'ozel-egitim-uzmani',
        expect.any(String),
        expect.objectContaining({
          mebStandards: true
        })
      );
    });
  });

  describe('Dyslexia Support', () => {
    it('should include dyslexia-friendly design in prompts', () => {
      const prompt = turkishAIIntegrationService.buildTurkishPrompt(
        'okuma_anlama',
        4,
        'Test',
        'Kolay'
      );

      expect(prompt).toContain('Disleksi dostu');
      expect(prompt).toContain('Lexend font');
      expect(prompt).toContain('geniş satır aralığı');
    });

    it('should prioritize success architecture for dyslexic students', () => {
      const prompt = turkishAIIntegrationService.buildTurkishPrompt(
        'yazim_noktalama',
        5,
        'Noktalama',
        'Kolay'
      );

      expect(prompt).toContain('Başarı mimarisi');
      expect(prompt).toContain('İlk aktivite kolay');
      expect(prompt).toContain('güven inşası');
    });
  });
});
