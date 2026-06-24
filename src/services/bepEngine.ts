/**
 * BDMIND — BEP (Bireysel Eğitim Planı) Engine
 * 
 * AI-powered IEP generator with SMART goals
 * MEB (Ministry of Education) compliant
 * Evidence-based intervention recommendations
 */

import { AppError } from '../utils/AppError.js';
import { generateWithGemini } from '../services/geminiClient.js';
import { dlpService } from './privacyService.js';
import { BEP, CognitiveProfile, LearningDNA, NeuroStudentProfile } from '../types/neuroProfile.js';
import { logError, logInfo } from '../utils/logger.js';
import { auth, db } from './firebaseClient.js';
import { doc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

/**
 * SMART Goal Template
 */
export interface SMARTGoal {
  domain: string;
  objective: string;
  baseline: number;
  target: number;
  timeline: string;
  strategies: string[];
  accommodations: string[];
  progress: number; // 0-100
}

/**
 * BEP Generation Input
 */
export interface BEPInput {
  student: NeuroStudentProfile;
  assessmentData: CognitiveProfile;
  learningProfile: LearningDNA;
  teacherNotes?: string;
  parentInput?: string;
  previousBEP?: BEP;
}

/**
 * BEP Engine Service
 */
export class BEPEngine {
  /**
   * Generate comprehensive BEP with AI
   */
  async generateBEP(input: BEPInput): Promise<BEP> {
    try {
      logInfo('Generating BEP for student', {
        studentId: input.student.studentId,
        domains: ['reading', 'math', 'attention', 'cognitive'],
      });

      // Generate SMART goals using AI
      const goals = await this.generateSMARTGoals(input);

      const bepRef = doc(db, 'beps', `bep_${Date.now()}_${input.student.studentId}`);
      const bepId = bepRef.id;

      // Extract current user Info
      const currentUser = auth.currentUser;
      const createdByUid = currentUser ? currentUser.uid : 'system';
      const currentUserDisplayName = currentUser?.displayName || 'Uzman Öğretmen';

      // Create BEP
      const bep: BEP = {
        id: bepId,
        studentId: input.student.studentId,
        createdAt: new Date().toISOString(),
        createdBy: createdByUid,
        status: 'draft',
        goals,
        assessments: this.generateAssessmentSchedule(),
        team: this.buildTeam(input, currentUserDisplayName),
        reviews: [],
      };

      // Save to Firestore
      await setDoc(bepRef, bep);

      logInfo('BEP generated successfully', {
        bepId: bep.id,
        goalCount: goals.length,
      });

      return bep;
    } catch (error: unknown) {
      if (error instanceof AppError) {
        logError(error);
      } else {
        const appError = new AppError(
          'BEP oluşturulurken hata oluştu',
          'BEP_GENERATION_FAILED',
          500,
          { error: error instanceof Error ? error.message : String(error) }
        );
        logError(appError);
      }
      throw new AppError(
        'BEP oluşturulurken hata oluştu',
        'BEP_GENERATION_FAILED',
        500
      );
    }
  }

  /**
   * Generate SMART goals based on student profile
   */
  private async generateSMARTGoals(input: BEPInput): Promise<SMARTGoal[]> {
    const { student, assessmentData, learningProfile } = input;

    // Build AI prompt
    const prompt = this.buildBEPPrompt(student, assessmentData, learningProfile);

    try {
      // Call Gemini for SMART goal generation
      const response = await generateWithGemini(prompt);
      
      // Parse response
      const goals = this.parseGoals(response);

      return goals;
    } catch (error: unknown) {
      if (error instanceof AppError) {
        logError(error);
      } else {
        const appError = new AppError(
          'AI goal generation failed',
          'AI_GOAL_GENERATION_FAILED',
          500,
          { error: error instanceof Error ? error.message : String(error) }
        );
        logError(appError);
      }
      
      // Fallback to rule-based goals
      return this.generateRuleBasedGoals(assessmentData, learningProfile);
    }
  }

  /**
   * Build AI prompt for BEP generation
   */
  private buildBEPPrompt(
    student: NeuroStudentProfile,
    cognitive: CognitiveProfile,
    learning: LearningDNA
  ): string {
    const sanitizedDiagnosis = student.diagnosis?.length
      ? student.diagnosis.map(d => dlpService.sanitizeDiagnosisForAI(d).sanitized).join(', ')
      : 'özel öğrenme desteği';

    return `
Sen özel eğitim uzmanısın. Öğrenci için Bireysel Eğitim Planı (BEP) hazırla.

ÖĞRENCİ PROFİLİ:
- Yaş: ${student.age}
- Sınıf: ${student.grade}
- Destek alanları: ${sanitizedDiagnosis}
- Öğrenme Stili: Görsel ${learning.learningStyles.visual}%, İşitsel ${learning.learningStyles.auditory}%

BİLİŞSEL PROFİL:
- İşlemleme Hızı: ${cognitive.processingSpeed.score}/100
- Çalışma Belleği: ${cognitive.workingMemory.score}/100
- Dikkat: ${cognitive.attention.score}/100
- Fonolojik Farkındalık: ${cognitive.phonologicalAwareness.score}/100
- Okuma Akıcılığı: ${cognitive.reading.wordsPerMinute} kelime/dakika

ZORLUK ALANLARI:
${learning.challenges.map(c => `- ${c}`).join('\n')}

GÜÇLÜ YÖNLER:
${learning.strengths.map(s => `- ${s}`).join('\n')}

GÖREV:
1. 3-5 SMART hedef oluştur (Specific, Measurable, Achievable, Relevant, Time-bound)
2. Her hedef için kanıta dayalı stratejiler öner
3. Uyarlama ve destekleri listele
4. MEB müfredatına uygun olsun
5. Kesinlikle tanı koyucu dil kullanma (disleksisi var, DEHB'li gibi). Bunun yerine 'disleksi desteğine ihtiyacı var' gibi ifadeler kullan.

ÇIKTI FORMATI (JSON):
[
  {
    "domain": "Okuma",
    "objective": "Somut, ölçülebilir hedef",
    "baseline": 40,
    "target": 70,
    "timeline": "2025-06-30",
    "strategies": ["Strateji 1", "Strateji 2"],
    "accommodations": ["Uyarlama 1"]
  }
]
`;
  }

  /**
   * Parse AI response into goals
   */
  private parseGoals(response: string): SMARTGoal[] {
    try {
      const parsed = JSON.parse(response);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid BEP response format');
      }

      return parsed.map((goal: any) => ({
        domain: goal.domain,
        objective: goal.objective,
        baseline: goal.baseline || 0,
        target: goal.target || 100,
        timeline: goal.timeline,
        strategies: goal.strategies || [],
        accommodations: goal.accommodations || [],
        progress: 0,
      }));
    } catch (error: unknown) {
      const appError = new AppError(
        'BEP parse error',
        'BEP_PARSE_FAILED',
        500,
        { error: error instanceof Error ? error.message : String(error) }
      );
      logError(appError);
      throw appError;
    }
  }

  /**
   * Fallback: Rule-based goal generation
   */
  private generateRuleBasedGoals(
    cognitive: CognitiveProfile,
    learning: LearningDNA
  ): SMARTGoal[] {
    const goals: SMARTGoal[] = [];

    // Reading fluency goal
    if (cognitive.reading.fluency < 70) {
      goals.push({
        domain: 'Okuma Akıcılığı',
        objective: 'Dakikada okunan kelime sayısını artırmak',
        baseline: cognitive.reading.wordsPerMinute,
        target: cognitive.reading.wordsPerMinute + 20,
        timeline: this.calculateTimeline(3), // 3 months
        strategies: [
          'Günlük 10 dakika tekrarlı okuma',
          'Eşli okuma aktivitesi',
          'Sesli okuma pratiği',
        ],
        accommodations: [
          'Büyük punto materyal',
          'Dyslexia-friendly font (Lexend/OpenDyslexic)',
          'Satır aralığı artırılmış metin',
        ],
        progress: 0,
      });
    }

    // Working memory goal
    if (cognitive.workingMemory.score < 60) {
      goals.push({
        domain: 'Çalışma Belleği',
        objective: 'İşitsel ve görsel bilgileri akılda tutma kapasitesini geliştirmek',
        baseline: cognitive.workingMemory.score,
        target: cognitive.workingMemory.score + 15,
        timeline: this.calculateTimeline(4),
        strategies: [
          'Bellek oyunları (görsel eşleştirme)',
          'Sayı tekrarı egzersizleri',
          'Çoklu adım yönerge takibi',
        ],
        accommodations: [
          'Sözlü yönergeleri tekrar etme',
          'Görsel destek kullanımı',
          'Bilgileri küçük parçalara bölme',
        ],
        progress: 0,
      });
    }

    // Attention goal
    if (cognitive.attention.score < 60 || cognitive.attention.adhdIndicators) {
      goals.push({
        domain: 'Dikkat ve Odaklanma',
        objective: 'Sürekli dikkat süresini uzatmak',
        baseline: cognitive.attention.sustained,
        target: cognitive.attention.sustained + 20,
        timeline: this.calculateTimeline(3),
        strategies: [
          'Pomodoro tekniği (25 dk çalışma + 5 dk mola)',
          'Dikkat egzersizleri',
          'Görsel izleme aktiviteleri',
        ],
        accommodations: [
          'Sessiz çalışma ortamı',
          'Sık mola verilmesi',
          'Kısa ve net yönergeler',
        ],
        progress: 0,
      });
    }

    return goals;
  }

  /**
   * Calculate timeline from now
   */
  private calculateTimeline(months: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate assessment schedule
   */
  private generateAssessmentSchedule(): BEP['assessments'] {
    const now = new Date();
    const assessments: BEP['assessments'] = [];

    // Monthly progress checks
    for (let i = 1; i <= 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() + i);
      
      assessments.push({
        type: 'İlerleme Değerlendirmesi',
        scheduledDate: date.toISOString().split('T')[0],
      });
    }

    // Comprehensive review at 6 months
    const reviewDate = new Date(now);
    reviewDate.setMonth(reviewDate.getMonth() + 6);
    
    assessments.push({
      type: 'Kapsamlı BEP Gözden Geçirme',
      scheduledDate: reviewDate.toISOString().split('T')[0],
    });

    return assessments;
  }

  /**
   * Build BEP team
   */
  private buildTeam(input: BEPInput, creatorName: string): BEP['team'] {
    const team: BEP['team'] = [];

    team.push({ name: creatorName, role: 'teacher' });
    team.push({ name: 'Veli', role: 'parent' });
    team.push({ name: 'Özel Eğitim Uzmanı', role: 'clinician' });

    return team;
  }

  /**
   * Update BEP progress
   */
  async updateProgress(bepId: string, goalIndex: number, progress: number): Promise<void> {
    try {
      const bepRef = doc(db, 'beps', bepId);
      // Firestore does not natively support array index updating easily, so we prefer an overall progress property 
      // or updating via a transaction/read-first update. But since this is specific to a goal:
      // For now we log it and assume the frontend handles local array state merging on full save.
      await updateDoc(bepRef, {
        [`goals.${goalIndex}.progress`]: progress,
        updatedAt: serverTimestamp()
      });
      logInfo('BEP progress updated', { bepId, goalIndex, progress });
    } catch (error) {
      logError(new AppError('BEP ilerleme güncellenemedi', 'BEP_UPDATE_FAILED', 500, { bepId, progress }));
    }
  }

  /**
   * Review and adjust BEP
   */
  async reviewBEP(
    bepId: string,
    reviewer: string,
    notes: string,
    adjustments: string[]
  ): Promise<void> {
    try {
      const bepRef = doc(db, 'beps', bepId);
      await updateDoc(bepRef, {
        status: 'active',
        reviews: arrayUnion({
          reviewer,
          notes,
          adjustments,
          reviewDate: new Date().toISOString()
        }),
        updatedAt: serverTimestamp()
      });
      logInfo('BEP reviewed', { bepId, reviewer, adjustments });
    } catch (error) {
      logError(new AppError('BEP incelmesi kaydedilemedi', 'BEP_REVIEW_FAILED', 500, { bepId }));
    }
  }
}

// Export singleton
export const bepEngine = new BEPEngine();
