import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class EvaluationAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('evaluation', deps);
  }

  buildPrompt(input: AgentInput): string {
    const { targetSkills } = input.goal;
    
    return `
      [ROL: ÖLÇME VE DEĞERLENDİRME UZMANI]
      GÖREV: "${targetSkills.join(', ')}" becerileri için SMART kriterlerine uygun değerlendirme metrikleri oluştur.
      
      KRİTERLER:
      1. Bilişsel Metrik: Hız, doğruluk, odak süresi.
      2. Davranışsal Metrik: Motivasyon, öz-düzenleme.
      3. Başarı Göstergesi: "%80 başarı oranı" gibi somut hedefleri belirle.
      
      Yanıtını JSON formatında 'criteria' dizisi olarak döndür.
    `;
  }

  protected toPedagogicalNote(): string {
    return 'Olculebilir kriterler sureci izlenebilir ve geribildirime acik hale getirir.';
  }
}
