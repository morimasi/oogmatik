
import { ScreeningResult, EvaluationCategory } from '../types/screening';
import { SCREENING_QUESTIONS, CATEGORY_LABELS, CATEGORY_COLORS } from '../data/screeningQuestions';

export const scoringEngine = {
    calculate: (
        answers: Record<string, number>, // questionId: value (0-4)
        respondentType: 'parent' | 'teacher',
        studentName: string
    ): ScreeningResult => {
        const scores: any = {};
        const categories = Object.keys(CATEGORY_LABELS) as EvaluationCategory[];

        // Initialize Scores
        categories.forEach(cat => {
            scores[cat] = {
                rawScore: 0,
                maxScore: 0,
                score: 0,
                findings: [],
                riskLevel: 'low',
                riskLabel: 'Düşük Risk',
                color: CATEGORY_COLORS[cat]
            };
        });

        // Process Answers
        let totalWeightedScore = 0;
        let totalMaxWeightedScore = 0;

        SCREENING_QUESTIONS.forEach(q => {
            // Filter by respondent type
            if (q.formType !== 'both' && q.formType !== respondentType) return;

            const value = answers[q.id] || 0; // 0: Hiç - 4: Her Zaman
            const maxVal = 4;
            
            // Add to category
            scores[q.category].rawScore += (value * q.weight);
            scores[q.category].maxScore += (maxVal * q.weight);

            // Add to totals
            totalWeightedScore += (value * q.weight);
            totalMaxWeightedScore += (maxVal * q.weight);

            // Detailed Findings (If High Frequency)
            if (value >= 3) {
                scores[q.category].findings.push(q.text);
            }
        });

        // Calculate Percentages and Risks
        categories.forEach(cat => {
            const data = scores[cat];
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

        const totalScore = totalMaxWeightedScore > 0 ? Math.round((totalWeightedScore / totalMaxWeightedScore) * 100) : 0;

        return {
            totalScore,
            categoryScores: scores,
            generatedAt: new Date().toISOString(),
            studentName,
            respondentRole: respondentType
        };
    }
};
