// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { assessmentEngineService, CATEGORY_RECOMMENDED_ACTIVITIES } from '../src/components/ScreeningAssessment/services/assessmentEngineService';
import { screeningDataService } from '../src/components/ScreeningAssessment/services/screeningDataService';
import { convertSubTestsToScreeningResult } from '../src/components/ScreeningAssessment/services/cognitiveBatteryAdapter';
import type { SubTestResult } from '../src/types';
import type { ScreeningResult } from '../src/types/screening';

describe('Tarama & Analiz Stüdyosu - Kapsamlı Mimari & Entegrasyon Duman Testleri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('assessmentEngineService - AI Analiz & Pedagojik Öneri Motoru', () => {
    const mockScreening: ScreeningResult = {
      id: 'test-scr-1',
      studentId: 'st-101',
      studentName: 'Can Yıldız',
      age: 8,
      grade: '2. Sınıf',
      date: new Date(),
      totalScore: 58,
      overallScore: 58,
      riskLevel: 'medium',
      status: 'completed',
      recommendations: ['Fonolojik okuma desteği'],
      strengths: ['Görsel Hafıza'],
      weaknesses: ['Okuma Akıcılığı'],
      categoryScores: {
        reading: { score: 45, rawScore: 9, maxScore: 20, riskLevel: 'high', riskLabel: 'Yüksek Risk', findings: ['Harf benzerliklerinde zorlanma'], color: 'red' },
        writing: { score: 60, rawScore: 12, maxScore: 20, riskLevel: 'moderate', riskLabel: 'Orta Risk', findings: ['Yavaş yazma'], color: 'yellow' },
        language: { score: 75, rawScore: 15, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: [], color: 'green' },
        motor_spatial: { score: 80, rawScore: 16, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: [], color: 'green' },
        attention: { score: 50, rawScore: 10, maxScore: 20, riskLevel: 'moderate', riskLabel: 'Orta Risk', findings: ['Odaklanma dalgalanması'], color: 'yellow' },
        math: { score: 70, rawScore: 14, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük Risk', findings: [], color: 'green' },
      },
      detailedResults: { reading: 45, writing: 60, attention: 50, memory: 70, visual: 80, auditory: 65 },
      generatedAt: new Date().toISOString(),
      respondentRole: 'teacher',
    };

    it('buildAnalysisPrompt tanı koyucu olmayan etik ve pedagojik kuralları içermelidir', () => {
      const prompt = assessmentEngineService.buildAnalysisPrompt(mockScreening);
      expect(prompt).toContain('KESİNLİKLE TANI KOYUCU DİL KULLANMA');
      expect(prompt).toContain('Bilişsel destek ihtiyacı');
      expect(prompt).toContain('Can Yıldız');
      expect(prompt).toContain('Okuma (Disleksi)');
    });

    it('getRecommendedActivities zayıf alanlara uygun Activity Studio etkinlikleri önermelidir', () => {
      const recs = assessmentEngineService.getRecommendedActivities(mockScreening);
      expect(recs.length).toBeGreaterThan(0);
      const activityIds = recs.map((r) => r.activityId);
      // Okuma (high risk) ve Dikkat (moderate risk) ve Yazma (moderate risk) önerileri gelmeli
      expect(activityIds).toContain('VISUAL_ODD_ONE_OUT');
      expect(activityIds).toContain('FIND_THE_DIFFERENCE');
    });

    it('normalizeActionSteps karmaşık veya düz dizileri güvenle diziye dönüştürmelidir', () => {
      const stringSteps = ['Adım 1', 'Adım 2'];
      expect(assessmentEngineService.normalizeActionSteps(stringSteps)).toEqual(stringSteps);

      const objectSteps = [{ area: 'Okuma', description: 'Heceleme çalışması', intervention: 'Her gün 10 dk' }];
      const normalized = assessmentEngineService.normalizeActionSteps(objectSteps);
      expect(normalized[0]).toContain('Okuma');
      expect(normalized[0]).toContain('Heceleme çalışması');
    });
  });

  describe('screeningDataService - Offline-First & Veri Kayıt İşlevleri', () => {
    it('getMockData 3 adet tutarlı ve tam kategori puanlarına sahip tarama dönmelidir', () => {
      const mockData = screeningDataService.getMockData();
      expect(mockData.length).toBe(3);
      mockData.forEach((item) => {
        expect(item.id).toBeDefined();
        expect(item.categoryScores.reading).toBeDefined();
        expect(item.categoryScores.attention).toBeDefined();
        expect(item.categoryScores.math).toBeDefined();
      });
    });

    it('computeAnalytics toplam, risk dağılımı ve alan ortalamalarını doğru hesaplamalıdır', () => {
      const mockData = screeningDataService.getMockData();
      const analytics = screeningDataService.computeAnalytics(mockData);
      expect(analytics).not.toBeNull();
      expect(analytics?.total).toBe(3);
      expect(analytics?.riskDistribution).toBeDefined();
      expect(analytics?.categoryAverages.reading).toBeGreaterThan(0);
      expect(analytics?.categoryAverages.math).toBeGreaterThan(0);
    });

    it('local storage tarama kaydı ve okuma sorunsuz çalışmalıdır', () => {
      const mockData = screeningDataService.getMockData();
      screeningDataService.saveLocalScreenings(mockData);
      const retrieved = screeningDataService.getLocalScreenings();
      expect(retrieved.length).toBe(3);
      expect(retrieved[0].studentName).toBe('Ali Yılmaz');
    });
  });

  describe('cognitiveBatteryAdapter - İnteraktif Bataryayı Tarama Sonucuna Dönüştürme', () => {
    it('11 alt test sonucunu 6 temel değerlendirme kategorisine ağırlıklı normalize etmelidir', () => {
      const subTests: SubTestResult[] = [
        { testId: 'phonological_loop', name: 'Fonolojik Döngü', score: 40, rawScore: 4, totalItems: 10, avgReactionTime: 800, accuracy: 40, status: 'completed', timestamp: Date.now() },
        { testId: 'selective_attention', name: 'Seçici Dikkat', score: 85, rawScore: 17, totalItems: 20, avgReactionTime: 450, accuracy: 85, status: 'completed', timestamp: Date.now() },
        { testId: 'logical_reasoning', name: 'Mantıksal Akıl Yürütme', score: 90, rawScore: 9, totalItems: 10, avgReactionTime: 1200, accuracy: 90, status: 'completed', timestamp: Date.now() },
      ];

      const meta = {
        studentName: 'Zeynep Kaya',
        studentId: 'st-202',
        age: 9,
        grade: '3. Sınıf',
        concerns: ['Okuma'],
      };

      const result = convertSubTestsToScreeningResult(subTests, meta);
      expect(result.studentName).toBe('Zeynep Kaya');
      expect(result.categoryScores.reading).toBeDefined();
      expect(result.categoryScores.attention).toBeDefined();
      expect(result.categoryScores.math).toBeDefined();
      expect(result.strengths.length).toBeGreaterThan(0);
      expect(result.weaknesses.length).toBeGreaterThan(0);
      expect(result.overallScore).toBeGreaterThan(0);
    });
  });
});
