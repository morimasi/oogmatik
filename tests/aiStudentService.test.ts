/**
 * OOGMATIK - AI Student Service Tests
 * Test suite for AI-enhanced student analysis
 */

import { describe, it, expect } from 'vitest';
import { aiStudentService } from '../services/aiStudentService';
import { Student } from '../types/student';

describe('AI Student Service', () => {
  const mockStudent: Student = {
    id: 'student-123',
    name: 'Test Öğrenci',
    age: 10,
    grade: '4. Sınıf',
    profile: 'dyslexia',
    strengths: ['Görsel öğrenme', 'Yaratıcılık', 'Problem çözme'],
    challenges: ['Okuma akıcılığı', 'Yazım'],
    avatar: 'https://example.com/avatar.png',
    createdAt: new Date().toISOString()
  };

  describe('analyzeStudent', () => {
    it('should perform comprehensive student analysis', async () => {
      const analysis = await aiStudentService.analyzeStudent(mockStudent);

      expect(analysis).toHaveProperty('strengths');
      expect(analysis).toHaveProperty('challenges');
      expect(analysis).toHaveProperty('recommendations');
      expect(analysis).toHaveProperty('learningStyle');
      expect(analysis).toHaveProperty('attentionSpan');
      expect(analysis).toHaveProperty('motivationLevel');
      expect(analysis).toHaveProperty('progressTrend');
      expect(analysis).toHaveProperty('interventionNeeded');
      expect(analysis).toHaveProperty('agentInsights');
    });

    it('should include insights from all 4 expert agents', async () => {
      const analysis = await aiStudentService.analyzeStudent(mockStudent);

      expect(analysis.agentInsights['ozel-ogrenme-uzmani']).toBeDefined();
      expect(analysis.agentInsights['ozel-egitim-uzmani']).toBeDefined();
      expect(analysis.agentInsights['yazilim-muhendisi']).toBeDefined();
      expect(analysis.agentInsights['ai-muhendisi']).toBeDefined();
    });

    it('should provide actionable recommendations', async () => {
      const analysis = await aiStudentService.analyzeStudent(mockStudent);

      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('should identify learning style', async () => {
      const analysis = await aiStudentService.analyzeStudent(mockStudent);

      expect(['görsel', 'işitsel', 'kinestetik', 'karma']).toContain(
        analysis.learningStyle
      );
    });

    it('should assess attention span', async () => {
      const analysis = await aiStudentService.analyzeStudent(mockStudent);

      expect(['short', 'medium', 'long']).toContain(analysis.attentionSpan);
    });

    it('should evaluate motivation level', async () => {
      const analysis = await aiStudentService.analyzeStudent(mockStudent);

      expect(['low', 'medium', 'high']).toContain(analysis.motivationLevel);
    });
  });

  describe('generatePersonalizedContent', () => {
    it('should generate content tailored to student', async () => {
      const content = await aiStudentService.generatePersonalizedContent(
        mockStudent,
        'Türkçe',
        'Okuma anlama geliştirme'
      );

      expect(content).toHaveProperty('activityType');
      expect(content).toHaveProperty('difficulty');
      expect(content).toHaveProperty('duration');
      expect(content).toHaveProperty('materials');
      expect(content).toHaveProperty('instructions');
      expect(content).toHaveProperty('pedagogicalRationale');
      expect(content).toHaveProperty('expectedOutcomes');
    });

    it('should include pedagogical rationale', async () => {
      const content = await aiStudentService.generatePersonalizedContent(
        mockStudent,
        'Matematik',
        'Temel işlemler'
      );

      expect(content.pedagogicalRationale).toBeDefined();
      expect(content.pedagogicalRationale.length).toBeGreaterThan(10);
    });

    it('should adapt difficulty to student profile', async () => {
      const content = await aiStudentService.generatePersonalizedContent(
        mockStudent,
        'Okuma',
        'Hızlı okuma'
      );

      expect(['Kolay', 'Orta', 'Zor']).toContain(content.difficulty);
    });
  });

  describe('generateBEPSuggestions', () => {
    it('should generate SMART BEP goals', async () => {
      const bep = await aiStudentService.generateBEPSuggestions(mockStudent);

      expect(bep).toHaveProperty('goals');
      expect(bep).toHaveProperty('timeline');
      expect(bep).toHaveProperty('resources');
      expect(bep).toHaveProperty('evaluationCriteria');
      expect(bep).toHaveProperty('familyInvolvement');
    });

    it('should create measurable goals', async () => {
      const bep = await aiStudentService.generateBEPSuggestions(mockStudent);

      expect(Array.isArray(bep.goals)).toBe(true);
      expect(bep.goals.length).toBeGreaterThan(0);

      bep.goals.forEach(goal => {
        expect(goal).toHaveProperty('objective');
        expect(goal).toHaveProperty('targetDate');
        expect(goal).toHaveProperty('measurableIndicator');
        expect(goal).toHaveProperty('supportStrategies');
        expect(goal).toHaveProperty('progress');
      });
    });

    it('should include family involvement strategies', async () => {
      const bep = await aiStudentService.generateBEPSuggestions(mockStudent);

      expect(Array.isArray(bep.familyInvolvement)).toBe(true);
      expect(bep.familyInvolvement.length).toBeGreaterThan(0);
    });
  });

  describe('validateProgress', () => {
    it('should validate student progress', async () => {
      const recentPerformance = {
        reading: 75,
        writing: 65,
        math: 80
      };

      const validation = await aiStudentService.validateProgress(
        mockStudent,
        recentPerformance
      );

      expect(validation).toHaveProperty('isOnTrack');
      expect(validation).toHaveProperty('concernAreas');
      expect(validation).toHaveProperty('interventions');
      expect(validation).toHaveProperty('strengthAreas');
      expect(validation).toHaveProperty('nextSteps');
    });

    it('should identify areas of concern', async () => {
      const poorPerformance = {
        reading: 45,
        writing: 40,
        math: 50
      };

      const validation = await aiStudentService.validateProgress(
        mockStudent,
        poorPerformance
      );

      expect(validation.concernAreas.length).toBeGreaterThan(0);
      expect(validation.interventionNeeded).toBe(true);
    });

    it('should recommend interventions when needed', async () => {
      const recentPerformance = {
        reading: 55,
        writing: 50,
        math: 60
      };

      const validation = await aiStudentService.validateProgress(
        mockStudent,
        recentPerformance
      );

      if (!validation.isOnTrack) {
        expect(validation.interventions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('generateParentReport', () => {
    it('should generate parent-friendly report', async () => {
      const report = await aiStudentService.generateParentReport(
        mockStudent,
        'monthly'
      );

      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('achievements');
      expect(report).toHaveProperty('areasForGrowth');
      expect(report).toHaveProperty('homeActivities');
      expect(report).toHaveProperty('parentTips');
    });

    it('should use supportive language', async () => {
      const report = await aiStudentService.generateParentReport(
        mockStudent,
        'weekly'
      );

      // Check that diagnostic language is avoided
      expect(report.summary.toLowerCase()).not.toContain('disleksisi var');
      expect(report.summary.toLowerCase()).not.toContain('tanı');
    });

    it('should include home activities', async () => {
      const report = await aiStudentService.generateParentReport(
        mockStudent,
        'monthly'
      );

      expect(Array.isArray(report.homeActivities)).toBe(true);
      expect(report.homeActivities.length).toBeGreaterThan(0);
    });

    it('should provide parent tips', async () => {
      const report = await aiStudentService.generateParentReport(
        mockStudent,
        'quarterly'
      );

      expect(Array.isArray(report.parentTips)).toBe(true);
      expect(report.parentTips.length).toBeGreaterThan(0);
    });
  });

  describe('findPeerMatches', () => {
    const allStudents: Student[] = [
      mockStudent,
      {
        id: 'student-456',
        name: 'Peer 1',
        age: 10,
        grade: '4. Sınıf',
        profile: 'dyslexia',
        strengths: ['Matematik', 'Mantık'],
        challenges: ['Okuma'],
        avatar: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 'student-789',
        name: 'Peer 2',
        age: 11,
        grade: '5. Sınıf',
        profile: 'adhd',
        strengths: ['Yaratıcılık', 'Spor'],
        challenges: ['Dikkat'],
        avatar: '',
        createdAt: new Date().toISOString()
      }
    ];

    it('should find suitable peer matches', async () => {
      const matches = await aiStudentService.findPeerMatches(
        mockStudent,
        allStudents
      );

      expect(Array.isArray(matches)).toBe(true);
    });

    it('should include match scores', async () => {
      const matches = await aiStudentService.findPeerMatches(
        mockStudent,
        allStudents
      );

      matches.forEach(match => {
        expect(match.matchScore).toBeGreaterThanOrEqual(0);
        expect(match.matchScore).toBeLessThanOrEqual(100);
      });
    });

    it('should identify common strengths', async () => {
      const matches = await aiStudentService.findPeerMatches(
        mockStudent,
        allStudents
      );

      matches.forEach(match => {
        expect(Array.isArray(match.commonStrengths)).toBe(true);
      });
    });

    it('should suggest collaborative activities', async () => {
      const matches = await aiStudentService.findPeerMatches(
        mockStudent,
        allStudents
      );

      matches.forEach(match => {
        expect(Array.isArray(match.activitySuggestions)).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle student with minimal data', async () => {
      const minimalStudent: Student = {
        id: 'minimal-123',
        name: 'Minimal Student',
        age: 8,
        grade: '3. Sınıf',
        profile: 'mixed',
        avatar: '',
        createdAt: new Date().toISOString()
      };

      const analysis = await aiStudentService.analyzeStudent(minimalStudent);
      expect(analysis).toBeDefined();
    });

    it('should handle student with extensive data', async () => {
      const detailedStudent: Student = {
        ...mockStudent,
        strengths: [
          'Görsel öğrenme',
          'Yaratıcılık',
          'Problem çözme',
          'Sosyal beceriler',
          'Spor'
        ],
        challenges: [
          'Okuma akıcılığı',
          'Yazım',
          'Dikkat süresi',
          'Organizasyon'
        ],
        recentAssessments: [
          { type: 'reading', score: 75, date: '2026-03-01' },
          { type: 'math', score: 85, date: '2026-03-01' }
        ]
      };

      const analysis = await aiStudentService.analyzeStudent(detailedStudent);
      expect(analysis).toBeDefined();
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });
});
