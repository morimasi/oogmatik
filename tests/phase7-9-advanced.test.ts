/**
 * OOGMATIK — Phases 7-9 Final Integration Test Suite
 * 
 * Tests:
 * 1. Analytics & Reporting Engine
 * 2. Predictive Analytics & ML
 * 3. Mobile App Services
 * 4. Advanced AI Services
 * 5. Integration & Performance
 */

import { describe, it, expect } from 'vitest';
import { analyticsEngine } from '../src/services/analyticsEngine.js';
import { mlEngine } from '../src/services/mlEngine.js';
import { mobileAppService } from '../src/services/mobileAppService.js';
import { advancedAI } from '../src/services/advancedAI.js';

describe('Phases 7-9: Advanced Features Integration', () => {
  
  describe('1. Analytics Engine', () => {
    it('should retrieve dashboard metrics', async () => {
      const metrics = await analyticsEngine.getDashboardMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.activeUsers).toBeGreaterThan(0);
      expect(metrics.avgCompletionRate).toBeGreaterThan(0);
      expect(metrics.activitiesCompleted).toBeGreaterThan(0);
    });

    it('should perform cohort analysis', async () => {
      const cohorts = await analyticsEngine.getCohortAnalysis(6);
      
      expect(cohorts).toBeDefined();
      expect(cohorts.length).toBe(6);
      
      cohorts.forEach(cohort => {
        expect(cohort.cohort).toBeDefined();
        expect(cohort.size).toBeGreaterThan(0);
        expect(cohort.retention.week1).toBeGreaterThanOrEqual(0);
        expect(cohort.avgImprovement).toBeGreaterThanOrEqual(0);
      });
    });

    it('should create A/B test', async () => {
      const test = await analyticsEngine.createABTest({
        name: 'New Reading Activity',
        description: 'Testing new interactive reading activity',
        startDate: new Date().toISOString(),
        hypothesis: 'Interactive activities improve engagement by 20%',
        primaryMetric: 'completion_rate',
        confidence: 0,
        significant: false,
      });
      
      expect(test).toBeDefined();
      expect(test.id).toMatch(/^ab_test_/);
      expect(test.status).toBe('draft');
      expect(test.variants).toHaveLength(2);
    });

    it('should calculate statistical significance', () => {
      const test = {
        id: 'test_1',
        name: 'Test',
        description: 'Test',
        startDate: new Date().toISOString(),
        status: 'running' as const,
        hypothesis: 'Test hypothesis',
        primaryMetric: 'conversion',
        variants: [
          {
            name: 'A',
            traffic: 50,
            metrics: {
              conversions: 100,
              visitors: 500,
              conversionRate: 0.20,
              avgSessionTime: 15,
              completionRate: 0.65,
            },
          },
          {
            name: 'B',
            traffic: 50,
            metrics: {
              conversions: 150,
              visitors: 500,
              conversionRate: 0.30,
              avgSessionTime: 18,
              completionRate: 0.72,
            },
          },
        ],
        confidence: 0,
        significant: false,
      };
      
      const result = analyticsEngine.calculateSignificance(test);
      
      expect(result).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.significant).toBeDefined();
    });

    it('should generate predictions', async () => {
      const predictions = await analyticsEngine.getPredictions();
      
      expect(predictions).toBeDefined();
      expect(Array.isArray(predictions)).toBe(true);
      expect(predictions.length).toBeGreaterThan(0);
      
      predictions.forEach(pred => {
        expect(pred.metric).toBeDefined();
        expect(pred.currentValue).toBeDefined();
        expect(pred.predictedValue).toBeDefined();
        expect(pred.confidence).toBeGreaterThan(0);
        expect(pred.trend).toBeDefined();
      });
    });

    it('should export data to CSV', () => {
      const data = [
        { name: 'Student 1', score: 85, completed: true },
        { name: 'Student 2', score: 72, completed: false },
      ];
      
      const csv = analyticsEngine.exportToCSV(data, 'report');
      
      expect(csv).toContain('name,score,completed');
      expect(csv).toContain('Student 1,85,true');
      expect(csv).toContain('Student 2,72,false');
    });
  });

  describe('2. ML Engine', () => {
    it('should predict student performance', async () => {
      const prediction = await mlEngine.predictStudentPerformance('student_1', {
        age: 8,
        diagnosis: ['Disleksi'],
        sessionCount: 25,
        avgCompletionRate: 65,
        avgAccuracy: 58,
        daysSinceLastLogin: 3,
        bepProgress: 45,
        plateauWeeks: 2,
      });
      
      expect(prediction).toBeDefined();
      expect(prediction.predictedValue).toBeGreaterThanOrEqual(0);
      expect(prediction.predictedValue).toBeLessThanOrEqual(100);
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.riskLevel).toBeDefined();
      expect(prediction.recommendations.length).toBeGreaterThan(0);
    });

    it('should assess risk levels correctly', async () => {
      // High performance = low risk
      const highPerf = await mlEngine.predictStudentPerformance('s1', {
        age: 9,
        diagnosis: [],
        sessionCount: 50,
        avgCompletionRate: 90,
        avgAccuracy: 88,
        daysSinceLastLogin: 1,
        bepProgress: 80,
        plateauWeeks: 0,
      });
      
      expect(highPerf.riskLevel).toBe('low');

      // Low performance = high risk
      const lowPerf = await mlEngine.predictStudentPerformance('s2', {
        age: 7,
        diagnosis: ['Disleksi', 'DEHB'],
        sessionCount: 5,
        avgCompletionRate: 30,
        avgAccuracy: 25,
        daysSinceLastLogin: 15,
        bepProgress: 10,
        plateauWeeks: 5,
      });
      
      expect(lowPerf.riskLevel).toBe('critical');
    });

    it('should predict churn probability', async () => {
      const churn = await mlEngine.predictChurn('student_1', {
        lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        sessionFrequency: 0.5,
        engagementTrend: 'decreasing',
        satisfactionScore: 40,
      });
      
      expect(churn).toBeDefined();
      expect(churn.churnProbability).toBeGreaterThan(0);
      expect(churn.timeframe).toBeDefined();
      expect(churn.reasons.length).toBeGreaterThan(0);
      expect(churn.intervention.length).toBeGreaterThan(0);
    });

    it('should detect anomalies', () => {
      const data = [70, 72, 68, 71, 73, 100, 69, 71]; // 100 is anomaly
      const result = mlEngine.detectAnomalies(data, 2);
      
      expect(result.anomalies.length).toBeGreaterThan(0);
      expect(result.mean).toBeGreaterThan(0);
      expect(result.stdDev).toBeGreaterThan(0);
    });

    it('should optimize learning path', () => {
      const plan = mlEngine.optimizeLearningPath('student_1', 50, 80, {
        sessionsPerWeek: 3,
        minutesPerSession: 30,
        preferredActivities: ['reading', 'phonics'],
      });
      
      expect(plan.weeks).toBeGreaterThan(0);
      expect(plan.sessions).toBeGreaterThan(0);
      expect(plan.plan.length).toBeGreaterThan(0);
    });

    it('should train model', async () => {
      const trainingData = Array.from({ length: 100 }, (_, i) => ({
        studentId: `student_${i}`,
        features: {
          age: 7 + Math.floor(Math.random() * 5),
          diagnosis: ['Disleksi'],
          sessionCount: Math.floor(Math.random() * 50),
          avgCompletionRate: 40 + Math.random() * 50,
          avgAccuracy: 35 + Math.random() * 55,
          daysSinceLastLogin: Math.floor(Math.random() * 20),
          bepProgress: Math.random() * 100,
          plateauWeeks: Math.floor(Math.random() * 6),
        },
        label: 50 + Math.random() * 50,
      }));
      
      const metrics = await mlEngine.trainModel(trainingData);
      
      expect(metrics).toBeDefined();
      expect(metrics.accuracy).toBeGreaterThan(0);
      expect(metrics.f1Score).toBeGreaterThan(0);
      expect(metrics.dataPoints).toBe(100);
    });
  });

  describe('3. Mobile App Service', () => {
    it('should initialize device', async () => {
      const device = await mobileAppService.initializeDevice({
        platform: 'android',
        version: '1.0.0',
        deviceId: 'test_device_123',
        networkType: 'wifi',
      });
      
      expect(device).toBeDefined();
      expect(device.platform).toBe('android');
      expect(device.deviceId).toBe('test_device_123');
    });

    it('should queue offline actions', () => {
      const action = mobileAppService.queueOfflineAction('activity_complete', {
        activityId: 'act_123',
        score: 85,
      });
      
      expect(action).toBeDefined();
      expect(action.type).toBe('activity_complete');
      expect(action.retryCount).toBe(0);
    });

    it('should sync offline queue', async () => {
      // Queue some actions
      mobileAppService.queueOfflineAction('progress_update', { progress: 50 });
      
      const result = await mobileAppService.syncOfflineQueue();
      
      expect(result).toBeDefined();
      expect(result.synced).toBeDefined();
      expect(result.failed).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it('should check network status', () => {
      const status = mobileAppService.getNetworkStatus();
      
      expect(status).toBeDefined();
      expect(status.online).toBeDefined();
      expect(status.networkType).toBeDefined();
      expect(status.offlineQueueSize).toBeDefined();
    });

    it('should schedule notifications', async () => {
      const notificationId = await mobileAppService.scheduleNotification({
        title: 'Practice Time!',
        body: 'Ready for today\'s activity?',
        priority: 'high',
      });
      
      expect(notificationId).toMatch(/^notif_/);
    });

    it('should clear offline queue', () => {
      mobileAppService.queueOfflineAction('note_add', { note: 'test' });
      mobileAppService.clearOfflineQueue();
      
      expect(mobileAppService.getOfflineQueue()).toHaveLength(0);
    });
  });

  describe('4. Advanced AI', () => {
    it('should recognize speech', async () => {
      const audioBlob = new Blob([], { type: 'audio/wav' });
      const result = await advancedAI.recognizeSpeech(audioBlob, 'tr-TR');
      
      expect(result).toBeDefined();
      expect(result.transcript).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.words.length).toBeGreaterThan(0);
    });

    it('should detect emotion from text', async () => {
      const result = await advancedAI.detectEmotion({
        type: 'text',
        content: 'Bu çok zor, yapamıyorum!',
      });
      
      expect(result).toBeDefined();
      expect(result.dominant).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should recognize handwriting', async () => {
      const imageBlob = new Blob([], { type: 'image/jpeg' });
      const result = await advancedAI.recognizeHandwriting(imageBlob, 'tr');
      
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.lines.length).toBeGreaterThan(0);
    });

    it('should generate personalized learning path', async () => {
      const path = await advancedAI.generateLearningPath(
        'student_1',
        3,
        ['Disleksi'],
        'Görsel',
        ['Okuma geliştirme', 'Fonolojik farkındalık'],
      );
      
      expect(path).toBeDefined();
      expect(path.studentId).toBe('student_1');
      expect(path.modules.length).toBeGreaterThan(0);
      expect(path.totalDuration).toBeGreaterThan(0);
      
      // Check modules
      path.modules.forEach(mod => {
        expect(mod.id).toBeDefined();
        expect(mod.name).toBeDefined();
        expect(mod.activities.length).toBeGreaterThan(0);
      });
    });

    it('should adapt learning path based on performance', async () => {
      const currentPath = await advancedAI.generateLearningPath(
        'student_1',
        5,
        ['Disleksi'],
        'Görsel',
        ['Okuma'],
      );
      
      const adapted = await advancedAI.adaptLearningPath(currentPath, {
        accuracy: 45, // Low accuracy
        completionRate: 40,
        timeSpent: 120,
        frustrationIndicators: ['long pauses', 'repeated errors'],
      });
      
      expect(adapted).toBeDefined();
      // Should lower difficulty
      expect(adapted.modules[0].difficulty).toBeLessThan(currentPath.modules[0].difficulty);
    });

    it('should generate multi-sensory content', async () => {
      const content = await advancedAI.generateMultiSensoryContent(
        'Elif ba öğretimi',
        'multisensory'
      );
      
      expect(content).toBeDefined();
      expect(content.visual.length).toBeGreaterThan(0);
      expect(content.auditory.length).toBeGreaterThan(0);
      expect(content.kinesthetic.length).toBeGreaterThan(0);
    });

    it('should filter content by mode', async () => {
      const visualContent = await advancedAI.generateMultiSensoryContent(
        'Hece parkuru',
        'visual'
      );
      
      expect(visualContent.visual.length).toBeGreaterThan(0);
      expect(visualContent.auditory).toHaveLength(0);
      expect(visualContent.kinesthetic).toHaveLength(0);
    });
  });

  describe('5. Integration Tests', () => {
    it('should flow: analytics → prediction → intervention', async () => {
      // Get metrics
      const metrics = await analyticsEngine.getDashboardMetrics();
      expect(metrics.activeUsers).toBeGreaterThan(0);

      // Predict student risk
      const prediction = await mlEngine.predictStudentPerformance('student_1', {
        age: 8,
        diagnosis: ['Disleksi'],
        sessionCount: 15,
        avgCompletionRate: 55,
        avgAccuracy: 48,
        daysSinceLastLogin: 5,
        bepProgress: 30,
        plateauWeeks: 2,
      });

      // Queue intervention if high risk
      if (prediction.riskLevel === 'high' || prediction.riskLevel === 'critical') {
        const action = mobileAppService.queueOfflineAction('note_add', {
          studentId: 'student_1',
          note: `Risk detected: ${prediction.riskLevel}`,
          recommendations: prediction.recommendations,
        });
        
        expect(action).toBeDefined();
      }
    });

    it('should flow: mobile → AI → analytics', async () => {
      // Mobile speech recognition
      const audioBlob = new Blob([], { type: 'audio/wav' });
      const speech = await advancedAI.recognizeSpeech(audioBlob, 'tr-TR');
      
      // Detect emotion
      const emotion = await advancedAI.detectEmotion({
        type: 'text',
        content: speech.transcript,
      });
      
      // Log to analytics (simulated)
      expect(speech.transcript).toBeDefined();
      expect(emotion.dominant).toBeDefined();
    });

    it('should handle complete student journey', async () => {
      // 1. Student logs in on mobile
      await mobileAppService.initializeDevice({
        platform: 'ios',
        version: '1.0.0',
        deviceId: 'student_ipad',
        networkType: 'wifi',
      });

      // 2. Complete activity
      mobileAppService.queueOfflineAction('activity_complete', {
        activityId: 'reading_101',
        score: 75,
        duration: 15,
      });

      // 3. Sync when online
      const syncResult = await mobileAppService.syncOfflineQueue();
      expect(syncResult.synced).toBeGreaterThanOrEqual(0);

      // 4. AI analysis
      const prediction = await mlEngine.predictStudentPerformance('student_1', {
        age: 8,
        diagnosis: ['Disleksi'],
        sessionCount: 20,
        avgCompletionRate: 70,
        avgAccuracy: 65,
        daysSinceLastLogin: 1,
        bepProgress: 50,
        plateauWeeks: 0,
      });

      // 5. Generate learning path
      const path = await advancedAI.generateLearningPath(
        'student_1',
        5,
        ['Disleksi'],
        'Görsel',
        ['Okuma akıcılığı'],
      );

      expect(path.modules.length).toBeGreaterThan(0);
    });
  });
});
