import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class VisualAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('visual', deps);
  }

  buildPrompt(input: AgentInput): string {
    const { profile, ageGroup } = input.goal;
    
    return `
      [ROL: ÖZEL EĞİTİM GÖRSEL TASARIMCISI]
      GÖREV: "${profile}" profili ve "${ageGroup}" yaş grubu için disleksi dostu görsel layout parametreleri belirle.
      
      KRİTERLER:
      1. Contrast: Yüksek kontrastlı, göz yormayan (Dyslexia-safe) renk paleti öner.
      2. Whitespace: ADHD için dikkat dağıtmayan geniş boşluklu yerleşim.
      3. Tipografi: Lexend font uyumlu hiyerarşi.
      4. İkonografi: Soyut değil, somut ve anlamı destekleyen görsel öğeler.
      
      Yanıtını JSON formatında 'visualSettings' objesi olarak döndür.
    `;
  }

  protected toPedagogicalNote(): string {
    return 'Gorsel destekler bilissel yuku azaltir ve odaklanmayi artirir.';
  }
}
