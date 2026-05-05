import { ScreeningResult, EvaluationCategory } from '../types/screening.js';
import {
  SCREENING_QUESTIONS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '../data/screeningQuestions.js';

export const scoringEngine = {
  calculate: (
    answers: Record<string, number>, // questionId: value (0-4)
    respondentType: 'parent' | 'teacher',
    studentName: string
  ): ScreeningResult => {
    const scores: Partial<
      Record<
        EvaluationCategory,
        {
          rawScore: number;
          maxScore: number;
          score: number;
          findings: string[];
          riskLevel: 'low' | 'moderate' | 'high';
          riskLabel: string;
          color: string;
        }
      >
    > = {};
    const categories = Object.keys(CATEGORY_LABELS) as EvaluationCategory[];

    // Initialize Scores
    categories.forEach((cat) => {
      scores[cat] = {
        rawScore: 0,
        maxScore: 0,
        score: 0,
        findings: [],
        riskLevel: 'low',
        riskLabel: 'Düşük Risk',
        color: CATEGORY_COLORS[cat],
      };
    });

    // Process Answers
    let totalWeightedScore = 0;
    let totalMaxWeightedScore = 0;

    SCREENING_QUESTIONS.forEach((q) => {
      // Filter by respondent type
      if (q.formType !== 'both' && q.formType !== respondentType) return;

      const value = answers[q.id] || 0; // 0: Hiç - 4: Her Zaman
      const maxVal = 4;

      // Add to category - NULL SAFETY FIX
      let catScore = scores[q.category];
      if (!catScore) {
        catScore = {
          rawScore: 0,
          maxScore: 0,
          score: 0,
          findings: [],
          riskLevel: 'low',
          riskLabel: 'Düşük Risk',
          color: CATEGORY_COLORS[q.category] || '#666',
        };
        scores[q.category] = catScore;
      }
      
      catScore.rawScore += value * q.weight;
      catScore.maxScore += maxVal * q.weight;

      // Add to totals
      totalWeightedScore += value * q.weight;
      totalMaxWeightedScore += maxVal * q.weight;

      // Detailed Findings (If High Frequency)
      if (value >= 3) {
        catScore.findings.push(q.text);
      }
    });

    // Calculate Percentages and Risks
    categories.forEach((cat: EvaluationCategory) => {
      const data = scores[cat];
      if (!data) return; // NULL SAFETY
      
      if (data.maxScore > 0) {
        data.score = Math.round((data.rawScore / data.maxScore) * 100);
      } else {
        data.score = 0;
      }

      if (data.score < 35) {
        data.riskLevel = 'low';
        data.riskLabel = 'Düşük Risk';
      } else if (data.score < 65) {
        data.riskLevel = 'moderate';
        data.riskLabel = 'Orta Risk (Takip Önerilir)';
      } else {
        data.riskLevel = 'high';
        data.riskLabel = 'Yüksek Risk (Destek Gerekli)';
      }
    });

    const totalScore =
      totalMaxWeightedScore > 0
        ? Math.round((totalWeightedScore / totalMaxWeightedScore) * 100)
        : 0;

    return {
      id: `screening_${Date.now()}`,
      studentId: 'unknown',
      studentName,
      age: 8,
      grade: '2',
      date: new Date(),
      totalScore,
      overallScore: totalScore,
      riskLevel: totalScore < 35 ? 'low' : totalScore < 65 ? 'medium' : 'high',
      status: 'completed' as const,
      recommendations: [],
      strengths: [],
      weaknesses: [],
      categoryScores: scores as Record<
        EvaluationCategory,
        {
          score: number;
          rawScore: number;
          maxScore: number;
          riskLevel: 'low' | 'high' | 'moderate';
          riskLabel: string;
          findings: string[];
          color: string;
        }
      >,
      detailedResults: {
        reading: scores['reading']?.score || 0,
        writing: scores['writing']?.score || 0,
        attention: scores['attention']?.score || 0,
        memory: scores['language']?.score || 0,
        visual: scores['motor_spatial']?.score || 0,
        auditory: scores['language']?.score || 0,
      },
      generatedAt: new Date().toISOString(),
      respondentRole: respondentType,
    };
  },
};
