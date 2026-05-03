import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class EvaluationAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('evaluation', deps);
  }

  buildPrompt(input: AgentInput): string {
    const { targetSkills, profile } = input.goal;
    
    return `
      [SİSTEM ROLÜ: OOGMATİK ÖLÇME, DEĞERLENDİRME VE VERİ ANALİSTİ]
      GÖREV: "${targetSkills.join(', ')}" becerileri için "${profile}" profiline uygun nöro-pedagojik değerlendirme sistemi kur.
      
      ANALİZ KRİTERLERİ (ZORUNLU):
      1. Bilişsel Metrikler: Hata örüntüleri, işlem hızı ve dikkat dalgalanmaları.
      2. Niteliksel Gözlem: Öğrencinin stres düzeyi ve strateji kullanımı için kontrol listesi.
      3. Gelişim Takibi: Önceki performansla karşılaştırma için temel metrikler (Baseline).
      4. Raporlama: Veli ve öğretmen için anlaşılır, suçlayıcı olmayan, çözüm odaklı geri bildirim dili.
      
      ÇIKTI YAPISI:
      {
        "evaluationSystem": {
          "metrics": [
            { "name": "...", "type": "quantitative | qualitative", "target": "..." }
          ],
          "successCriteria": ["...", "..."],
          "teacherObservationChecklist": ["...", "..."],
          "feedbackTemplates": {
            "success": "...",
            "needsWork": "..."
          }
        }
      }
    `;
  }

  protected toPedagogicalNote(): string {
    return 'Olculebilir kriterler sureci izlenebilir ve geribildirime acik hale getirir.';
  }
}
