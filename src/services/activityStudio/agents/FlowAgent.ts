import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class FlowAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('flow', deps);
  }

  buildPrompt(input: AgentInput): string {
    const { duration, difficulty } = input.goal;
    
    return `
      [ROL: ÖĞRENME TASARIMCISI (LXD)]
      GÖREV: ${duration} dakikalık eğitim akışını "Sarmal Öğrenme" modeline göre yapılandır.
      
      KRİTERLER:
      1. Intro (2-3 dk): Önceki bilgileri hatırlatma ve güven inşası.
      2. Core (5-10 dk): Yeni bilginin/becerinin "${difficulty}" seviyesinde sunumu.
      3. Challenge (3-5 dk): Öğrenilenin pekiştirilmesi.
      4. Cool-down (2 dk): Özet ve başarı hissi.
      
      Yanıtını JSON formatında 'steps' dizisi olarak döndür.
    `;
  }

  protected toPedagogicalNote(): string {
    return 'ZPD uyumlu akis ogrencinin adim adim ilerlemesini destekler.';
  }
}
