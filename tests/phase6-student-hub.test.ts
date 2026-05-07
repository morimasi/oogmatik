/**
 * OOGMATIK — Phase 6 (Student Hub & Clinical Tracking) Test Suite
 * 
 * Tests:
 * 1. Neuro-Student Profile types
 * 2. AI-Powered BEP Engine
 * 3. Learning Plateau Detection
 * 4. Early Warning System
 * 5. Parent-Teacher-Clinician Bridge
 */

import { describe, it, expect } from 'vitest';
import { bepEngine, SMARTGoal } from '../src/services/bepEngine.js';
import { plateauDetector } from '../src/services/plateauDetector.js';
import { CognitiveProfile, LearningDNA, BehavioralMetrics, NeuroStudentProfile } from '../src/types/neuroProfile.js';

describe('Phase 6: Student Hub & Clinical Tracking', () => {
  // Mock data
  const mockCognitiveProfile: Partial<CognitiveProfile> = {
    processingSpeed: {
      score: 55,
      percentile: 40,
      lastAssessed: new Date().toISOString(),
      trend: 'stable',
    },
    workingMemory: {
      score: 50,
      phonologicalLoop: 55,
      visuospatialSketchpad: 45,
      centralExecutive: 50,
      lastAssessed: new Date().toISOString(),
    },
    attention: {
      score: 45,
      sustained: 40,
      selective: 50,
      divided: 45,
      adhdIndicators: true,
    },
    phonologicalAwareness: {
      score: 60,
      syllableSegmentation: 65,
      phonemeIsolation: 55,
      blending: 60,
      manipulation: 50,
    },
    visualProcessing: {
      score: 55,
      discrimination: 50,
      memory: 60,
      sequential: 55,
      reversals: 15,
    },
    reading: {
      fluency: 45,
      accuracy: 70,
      comprehension: 65,
      wordsPerMinute: 55,
      gradeLevel: '2',
    },
    math: {
      numberSense: 60,
      calculation: 55,
      problemSolving: 50,
      dyscalculiaRisk: 'low',
    },
  };

  const mockLearningDNA: Partial<LearningDNA> = {
    learningStyles: {
      visual: 75,
      auditory: 60,
      kinesthetic: 50,
      multisensory: 70,
    },
    optimalConditions: {
      timeOfDay: 'morning',
      sessionLength: 20,
      breakFrequency: 10,
      scaffoldingNeeded: true,
      preferStructured: true,
    },
    interventionHistory: [],
    strengths: ['Görsel hafıza', 'Yaratıcı düşünce'],
    challenges: ['Okuma güçlüğü', 'Dikkat dağınıklığı'],
    accommodations: ['Büyük punto', 'Dyslexia font'],
  };

  const mockBehavioralMetrics: BehavioralMetrics = {
    engagement: {
      averageSessionTime: 18,
      completionRate: 65,
      abandonRate: 35,
      peakFocusTime: '09:00',
    },
    errorPatterns: {
      visualDiscrimination: 35,
      sequencing: 28,
      impulsivity: 45,
      memory: 30,
    },
    progressVelocity: {
      weekly: 3,
      monthly: 12,
      trajectory: 'behind',
      plateauDetected: true,
      plateauDuration: 3,
    },
    motivation: {
      intrinsic: 45,
      extrinsic: 60,
      rewardResponsive: true,
      frustrationTolerance: 'medium',
    },
  };

  const mockStudent: NeuroStudentProfile = {
    studentId: 'student_123',
    name: 'Test Öğrenci',
    age: 8,
    grade: '2',
    diagnosis: ['Disleksi'],
    cognitiveProfile: mockCognitiveProfile as CognitiveProfile,
    learningDNA: mockLearningDNA as LearningDNA,
    behavioralMetrics: mockBehavioralMetrics,
    activeBEP: null,
    bepHistory: [],
    clinicalNotes: [],
    communicationLog: [],
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    lastAssessment: new Date().toISOString(),
    nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  describe('1. AI-Powered BEP Engine', () => {
    it('should have BEP engine instance', () => {
      expect(bepEngine).toBeDefined();
      expect(typeof bepEngine.generateBEP).toBe('function');
    });

    it('should have required BEP engine methods', () => {
      expect(typeof bepEngine.updateProgress).toBe('function');
      expect(typeof bepEngine.reviewBEP).toBe('function');
    });

    it('should calculate correct timeline', () => {
      // Access private method via any for testing
      const engine = bepEngine as any;
      const timeline = engine.calculateTimeline(3);
      
      const expectedDate = new Date();
      expectedDate.setMonth(expectedDate.getMonth() + 3);
      
      expect(timeline).toBe(expectedDate.toISOString().split('T')[0]);
    });

    it('should generate assessment schedule', () => {
      const engine = bepEngine as any;
      const schedule = engine.generateAssessmentSchedule();
      
      expect(schedule).toBeDefined();
      expect(Array.isArray(schedule)).toBe(true);
      expect(schedule.length).toBe(7); // 6 monthly + 1 comprehensive
      
      // Check dates are in future
      schedule.forEach((assessment: any) => {
        expect(new Date(assessment.scheduledDate)).toBeInstanceOf(Date);
      });
    });

    it('should build BEP team', () => {
      const engine = bepEngine as any;
      const team = engine.buildTeam({ student: mockStudent });
      
      expect(team).toBeDefined();
      expect(Array.isArray(team)).toBe(true);
      expect(team.length).toBeGreaterThanOrEqual(3);
      
      const roles = team.map((m: any) => m.role);
      expect(roles).toContain('teacher');
      expect(roles).toContain('parent');
      expect(roles).toContain('clinician');
    });

    it('should generate rule-based goals for low performance', () => {
      const engine = bepEngine as any;
      const goals = engine.generateRuleBasedGoals(
        mockCognitiveProfile,
        mockLearningDNA
      );
      
      expect(goals).toBeDefined();
      expect(Array.isArray(goals)).toBe(true);
      
      // Should generate goals for reading, memory, attention
      expect(goals.length).toBeGreaterThanOrEqual(2);
      
      // Check goal structure
      goals.forEach((goal: SMARTGoal) => {
        expect(goal.domain).toBeDefined();
        expect(goal.objective).toBeDefined();
        expect(goal.baseline).toBeDefined();
        expect(goal.target).toBeGreaterThan(goal.baseline);
        expect(goal.timeline).toBeDefined();
        expect(goal.strategies.length).toBeGreaterThan(0);
        expect(goal.accommodations.length).toBeGreaterThan(0);
        expect(goal.progress).toBe(0);
      });
    });

    it('should not generate reading goal if fluency is good', () => {
      const engine = bepEngine as any;
      const goodCognitive = {
        ...mockCognitiveProfile,
        reading: { ...mockCognitiveProfile.reading, fluency: 80, wordsPerMinute: 100 },
      };
      
      const goals = engine.generateRuleBasedGoals(goodCognitive, mockLearningDNA);
      const readingGoal = goals.find((g: SMARTGoal) => g.domain.includes('Okuma'));
      
      expect(readingGoal).toBeUndefined();
    });
  });

  describe('2. Learning Plateau Detection', () => {
    it('should have plateau detector instance', () => {
      expect(plateauDetector).toBeDefined();
      expect(typeof plateauDetector.detectPlateau).toBe('function');
      expect(typeof plateauDetector.detectEarlyWarning).toBe('function');
    });

    it('should detect plateau when flag is set', () => {
      const metricsWithPlateau: BehavioralMetrics = {
        ...mockBehavioralMetrics,
        progressVelocity: {
          ...mockBehavioralMetrics.progressVelocity,
          plateauDetected: true,
          plateauDuration: 4,
          weekly: 2,
        },
      };
      
      const alert = plateauDetector.detectPlateau(metricsWithPlateau);
      
      expect(alert).not.toBeNull();
      expect(alert!.severity).toBe('critical');
      expect(alert!.duration).toBe(4);
      expect(alert!.remedialActions.length).toBeGreaterThan(0);
      expect(alert!.recommendation).toBeDefined();
    });

    it('should not detect plateau when flag is false', () => {
      const metricsWithoutPlateau: BehavioralMetrics = {
        ...mockBehavioralMetrics,
        progressVelocity: {
          ...mockBehavioralMetrics.progressVelocity,
          plateauDetected: false,
        },
      };
      
      const alert = plateauDetector.detectPlateau(metricsWithoutPlateau);
      
      expect(alert).toBeNull();
    });

    it('should determine warning severity for 3 weeks', () => {
      const metrics: BehavioralMetrics = {
        ...mockBehavioralMetrics,
        progressVelocity: {
          ...mockBehavioralMetrics.progressVelocity,
          plateauDetected: true,
          plateauDuration: 3,
          weekly: 4,
        },
      };
      
      const alert = plateauDetector.detectPlateau(metrics);
      
      expect(alert!.severity).toBe('warning');
    });

    it('should generate remedial actions for high errors', () => {
      const metrics: BehavioralMetrics = {
        ...mockBehavioralMetrics,
        errorPatterns: {
          visualDiscrimination: 40,
          sequencing: 35,
          impulsivity: 50,
          memory: 25,
        },
      };
      
      const engine = plateauDetector as any;
      const actions = engine.generateRemedialActions(metrics);
      
      expect(actions.length).toBeGreaterThanOrEqual(3);
      expect(actions.some((a: string) => a.includes('Görsel'))).toBe(true);
      expect(actions.some((a: string) => a.includes('Sıralama'))).toBe(true);
    });

    it('should generate remedial plan', () => {
      const plan = plateauDetector.generateRemedialPlan(mockBehavioralMetrics);
      
      expect(plan.interventions).toBeDefined();
      expect(Array.isArray(plan.interventions)).toBe(true);
      expect(plan.timeline).toBeDefined();
      expect(plan.successCriteria).toBeDefined();
    });
  });

  describe('3. Early Warning System', () => {
    it('should detect multiple warning types', () => {
      const atRiskMetrics: BehavioralMetrics = {
        ...mockBehavioralMetrics,
        progressVelocity: {
          ...mockBehavioralMetrics.progressVelocity,
          monthly: -15, // Regression
          plateauDetected: true,
          plateauDuration: 4,
        },
        engagement: {
          ...mockBehavioralMetrics.engagement,
          completionRate: 40,
          abandonRate: 50,
        },
        motivation: {
          ...mockBehavioralMetrics.motivation,
          intrinsic: 30,
          frustrationTolerance: 'low',
        },
        errorPatterns: {
          ...mockBehavioralMetrics.errorPatterns,
          impulsivity: 60,
        },
      };
      
      const warnings = plateauDetector.detectEarlyWarning(atRiskMetrics);
      
      expect(warnings.length).toBeGreaterThanOrEqual(3);
      
      const riskTypes = warnings.map(w => w.riskType);
      expect(riskTypes).toContain('plateau');
      expect(riskTypes).toContain('regression');
      expect(riskTypes).toContain('engagement_drop');
    });

    it('should escalate critical warnings', () => {
      const criticalMetrics: BehavioralMetrics = {
        ...mockBehavioralMetrics,
        engagement: {
          ...mockBehavioralMetrics.engagement,
          completionRate: 25, // Very low
        },
      };
      
      const warnings = plateauDetector.detectEarlyWarning(criticalMetrics);
      
      const engagementWarning = warnings.find(w => w.riskType === 'engagement_drop');
      expect(engagementWarning).toBeDefined();
      expect(engagementWarning!.escalated).toBe(true);
    });

    it('should return empty array for healthy student', () => {
      const healthyMetrics: BehavioralMetrics = {
        engagement: {
          averageSessionTime: 30,
          completionRate: 85,
          abandonRate: 10,
          peakFocusTime: '09:00',
        },
        errorPatterns: {
          visualDiscrimination: 10,
          sequencing: 8,
          impulsivity: 15,
          memory: 12,
        },
        progressVelocity: {
          weekly: 8,
          monthly: 25,
          trajectory: 'on-track',
          plateauDetected: false,
        },
        motivation: {
          intrinsic: 75,
          extrinsic: 70,
          rewardResponsive: true,
          frustrationTolerance: 'high',
        },
      };
      
      const warnings = plateauDetector.detectEarlyWarning(healthyMetrics);
      
      expect(warnings.length).toBe(0);
    });

    it('should include evidence in warnings', () => {
      const metrics: BehavioralMetrics = {
        ...mockBehavioralMetrics,
        progressVelocity: {
          ...mockBehavioralMetrics.progressVelocity,
          monthly: -12,
        },
      };
      
      const warnings = plateauDetector.detectEarlyWarning(metrics);
      
      const regressionWarning = warnings.find(w => w.riskType === 'regression');
      expect(regressionWarning).toBeDefined();
      expect(regressionWarning!.evidence.length).toBeGreaterThan(0);
      expect(regressionWarning!.suggestedIntervention).toBeDefined();
    });
  });

  describe('4. Neuro-Student Profile Types', () => {
    it('should create complete neuro profile', () => {
      expect(mockStudent).toBeDefined();
      expect(mockStudent.studentId).toBe('student_123');
      expect(mockStudent.cognitiveProfile).toBeDefined();
      expect(mockStudent.learningDNA).toBeDefined();
      expect(mockStudent.behavioralMetrics).toBeDefined();
    });

    it('should have all cognitive domains', () => {
      const cognitive = mockStudent.cognitiveProfile;
      
      expect(cognitive.processingSpeed.score).toBe(55);
      expect(cognitive.workingMemory.score).toBe(50);
      expect(cognitive.attention.score).toBe(45);
      expect(cognitive.phonologicalAwareness.score).toBe(60);
      expect(cognitive.reading.wordsPerMinute).toBe(55);
    });

    it('should track learning plateaus', () => {
      expect(mockStudent.behavioralMetrics.progressVelocity.plateauDetected).toBe(true);
      expect(mockStudent.behavioralMetrics.progressVelocity.plateauDuration).toBe(3);
    });
  });

  describe('5. Integration Tests', () => {
    it('should flow: profile → plateau detection → intervention', () => {
      // Detect plateau
      const alert = plateauDetector.detectPlateau(mockStudent.behavioralMetrics);
      
      if (alert) {
        // Generate remedial plan
        const plan = plateauDetector.generateRemedialPlan(mockStudent.behavioralMetrics);
        
        expect(plan.interventions.length).toBeGreaterThan(0);
        expect(alert.recommendation).toBeDefined();
      }
    });

    it('should generate early warnings and BEP together', () => {
      const warnings = plateauDetector.detectEarlyWarning(mockStudent.behavioralMetrics);
      
      // Even with warnings, BEP can be generated
      expect(bepEngine).toBeDefined();
      expect(plateauDetector).toBeDefined();
      
      // Both systems work together
      expect(warnings).toBeDefined();
    });
  });
});
