import type { ScreeningResult, EvaluationCategory } from '../../../types/screening';
import { CATEGORY_LABELS } from '../../../data/screeningQuestions';

export interface AIAnalysisResult {
  letter: string;
  actionSteps: string[];
}

export const assessmentEngineService = {
  buildAnalysisPrompt(result: ScreeningResult): string {
    const riskSummary = (Object.keys(result.categoryScores) as EvaluationCategory[])
      .map((cat) => {
        const data = result.categoryScores[cat];
        return `${CATEGORY_LABELS[cat]}: %${data.score} (${data.riskLabel})`;
      })
      .join('\n');

    const findings = (Object.keys(result.categoryScores) as EvaluationCategory[])
      .flatMap((cat) => result.categoryScores[cat]?.findings ?? []);

    return `
[ROL: KIDEMLİ EĞİTİM PSİKOLOĞU ve ÖZEL EĞİTİM UZMANI]
GÖREV: Aşağıdaki tarama testi sonuçlarına göre ebeveyne/öğretmene yönelik, endişeyi azaltan ama gerçekçi bir durum değerlendirmesi ve tavsiye mektubu yaz.

ÖĞRENCİ: ${result.studentName}
SONUÇLAR:
${riskSummary}

BULGULAR: ${findings.join(', ')}

İSTENEN ÇIKTI (JSON):
{
    "letter": "Empatik, profesyonel, 3 paragraflık bir değerlendirme yazısı.",
    "actionSteps": ["Somut öneri 1", "Somut öneri 2", "Somut öneri 3"]
}`;
  },

  getAIAnalysisSchema() {
    return {
      type: 'OBJECT' as const,
      properties: {
        letter: { type: 'STRING' as const },
        actionSteps: { type: 'ARRAY' as const, items: { type: 'STRING' as const } },
      },
      required: ['letter', 'actionSteps'],
    };
  },

  normalizeActionSteps(steps: unknown): string[] {
    if (!Array.isArray(steps)) return [];
    return steps.map((step: unknown) => {
      if (typeof step === 'string') return step;
      if (step !== null && typeof step === 'object') {
        const s = step as Record<string, unknown>;
        return [s.area, s.description, s.intervention].filter(Boolean).join(' - ') || String(step);
      }
      return String(step ?? '');
    });
  },

  renderActionStep(step: unknown): string {
    if (typeof step === 'string') return step;
    if (step !== null && typeof step === 'object') {
      const s = step as Record<string, unknown>;
      return [s.intervention, s.description, s.area].filter(Boolean).join(' - ') || JSON.stringify(step);
    }
    return String(step ?? '');
  },
};
