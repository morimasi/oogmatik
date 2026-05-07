/**
 * OOGMATIK — Learning Plateau Detection & Early Warning System
 * 
 * Detects learning plateaus early
 * Suggests remedial interventions
 * Monitors engagement and regression
 */

import { AppError } from '../utils/AppError.js';
import { logInfo, logWarn } from '../utils/logger.js';
import { BehavioralMetrics, PlateauAlert, EarlyWarning } from '../types/neuroProfile.js';

/**
 * Plateau Detection Service
 */
export class PlateauDetector {
  /**
   * Detect learning plateau
   */
  detectPlateau(metrics: BehavioralMetrics): PlateauAlert | null {
    const { progressVelocity, engagement } = metrics;

    // Check if plateau is detected
    if (!progressVelocity.plateauDetected) {
      return null;
    }

    const duration = progressVelocity.plateauDuration || 0;
    const weeklyRate = progressVelocity.weekly;

    // Determine severity
    const severity = duration >= 4 ? 'critical' : 'warning';

    // Build recommendation
    const recommendation = this.buildRecommendation(weeklyRate, duration);

    // Generate remedial actions
    const remedialActions = this.generateRemedialActions(metrics);

    return {
      studentId: 'student_id_placeholder', // TODO: Pass as parameter
      detectedAt: new Date().toISOString(),
      metric: 'overall_progress',
      duration,
      severity,
      recommendation,
      remedialActions,
    };
  }

  /**
   * Build recommendation based on plateau severity
   */
  private buildRecommendation(weeklyRate: number, duration: number): string {
    if (weeklyRate < 2 && duration >= 4) {
      return 'Öğrenme platosu tespit edildi. Acil müdahale önerilir. Öğretim stratejisi ve materyal değişikliği gerekli.';
    } else if (weeklyRate < 5 && duration >= 3) {
      return 'İlerleme hızı yavaşladı. Destek etkinlikleri ve ek pratik önerilir.';
    } else {
      return 'Hafif yavaşlama izleniyor. Mevcut program devam edebilir, ancak izleme sıklığı artırılmalı.';
    }
  }

  /**
   * Generate remedial actions
   */
  private generateRemedialActions(metrics: BehavioralMetrics): string[] {
    const actions: string[] = [];
    const { errorPatterns, engagement, motivation } = metrics;

    // High error rate → Targeted practice
    if (errorPatterns.visualDiscrimination > 30) {
      actions.push('Görsel ayırt etme egzersizleri günlük 10 dakika');
    }

    if (errorPatterns.sequencing > 25) {
      actions.push('Sıralama ve düzen aktiviteleri');
    }

    if (errorPatterns.impulsivity > 40) {
      actions.push('Durdur-düşün-yap stratejisi öğretimi');
    }

    // Low engagement → Motivation boost
    if (engagement.completionRate < 60) {
      actions.push('Ödül sistemi ve gamification uygulamaları');
    }

    // Low motivation
    if (motivation.intrinsic < 40) {
      actions.push('İlgi alanlarına uygun materyal hazırlanması');
    }

    // Short sessions
    if (engagement.averageSessionTime < 15) {
      actions.push('Pomodoro tekniği ile çalışma sürelerini böl');
    }

    return actions.length > 0 ? actions : ['Mevcut program takip edilmeli'];
  }

  /**
   * Early Warning System
   */
  detectEarlyWarning(metrics: BehavioralMetrics): EarlyWarning[] {
    const warnings: EarlyWarning[] = [];

    // Check plateau risk
    const plateau = this.detectPlateau(metrics);
    if (plateau) {
      warnings.push({
        studentId: plateau.studentId,
        riskType: 'plateau',
        detectedAt: plateau.detectedAt,
        confidence: plateau.severity === 'critical' ? 90 : 70,
        evidence: [
          `${plateau.duration} haftadır ilerleme kaydedilmiyor`,
          `Haftalık ilerleme: ${metrics.progressVelocity.weekly}%`,
        ],
        suggestedIntervention: plateau.recommendation,
        escalated: plateau.severity === 'critical',
      });
    }

    // Check regression
    if (metrics.progressVelocity.monthly < -10) {
      warnings.push({
        studentId: 'student_id_placeholder',
        riskType: 'regression',
        detectedAt: new Date().toISOString(),
        confidence: 85,
        evidence: [
          `Aylık ilerleme: ${metrics.progressVelocity.monthly}% (negatif)`,
          'Gerileme tespit edildi',
        ],
        suggestedIntervention: 'BEP gözden geçirilmeli, müdahale stratejileri acil güncellenmeli',
        escalated: true,
      });
    }

    // Check engagement drop
    if (metrics.engagement.completionRate < 50 || metrics.engagement.abandonRate > 40) {
      warnings.push({
        studentId: 'student_id_placeholder',
        riskType: 'engagement_drop',
        detectedAt: new Date().toISOString(),
        confidence: 80,
        evidence: [
          `Tamamlama oranı: ${metrics.engagement.completionRate}%`,
          `Terk oranı: ${metrics.engagement.abandonRate}%`,
        ],
        suggestedIntervention: 'Motivasyon artırıcı stratejiler, ilgi alanları araştırılmalı',
        escalated: metrics.engagement.completionRate < 30,
      });
    }

    // Check behavioral issues
    if (metrics.motivation.frustrationTolerance === 'low' && metrics.errorPatterns.impulsivity > 50) {
      warnings.push({
        studentId: 'student_id_placeholder',
        riskType: 'behavioral',
        detectedAt: new Date().toISOString(),
        confidence: 75,
        evidence: [
          'Düşük hayal kırıklığı toleransı',
          `Dürtüsellik göstergesi: ${metrics.errorPatterns.impulsivity}%`,
        ],
        suggestedIntervention: 'Davranışsal destek, duygusal düzenleme stratejileri',
        escalated: false,
      });
    }

    return warnings;
  }

  /**
   * Generate remedial plan
   */
  generateRemedialPlan(metrics: BehavioralMetrics): {
    interventions: string[];
    timeline: string;
    successCriteria: string;
  } {
    const interventions = this.generateRemedialActions(metrics);
    
    return {
      interventions,
      timeline: '2 hafta yoğun destek, sonra yeniden değerlendirme',
      successCriteria: 'Haftalık ilerleme >%5, tamamlama oranı >%70',
    };
  }
}

// Export singleton
export const plateauDetector = new PlateauDetector();
