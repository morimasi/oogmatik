import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class IdeationAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('ideation', deps);
  }

  buildPrompt(input: AgentInput): string {
    const { ageGroup, difficulty, profile } = input.goal;
    const topic = input.sanitizedPrompt.sanitizedTopic;

    return `
      [ROL: KIDEMLİ NÖRO-PEDAGOJİK TASARIMCI]
      GÖREV: "${topic}" konusu için disleksi/ADHD dostu 3 yaratıcı etkinlik fikri üret.
      
      BAĞLAM:
      - Yaş Grubu: ${ageGroup}
      - Zorluk: ${difficulty}
      - Öğrenci Profili: ${profile}
      
      STRATEJİ:
      1. Multisensory Yaklaşım: Görsel, işitsel ve dokunsal öğeleri harmanla.
      2. Scaffolding: İlk fikir her zaman güven inşası için kolaydan başlamalı.
      3. Bilişsel Yük: ADHD için kısa süreli odaklanma döngüleri planla.
      
      Yanıtını JSON formatında 'ideas' dizisi olarak döndür.
    `;
  }

  protected toPedagogicalNote(): string {
    return 'Ilk fikirler ogrenci guvenini artiracak sekilde kolaydan baslatilir.';
  }
}
