import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class IntegrationAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('integration', deps);
  }

  buildPrompt(input: AgentInput): string {
    const outputs = JSON.stringify(input.previousOutputs);
    
    return `
      [ROL: BAŞ MİMAR VE SİSTEM ENTEGRATÖRÜ]
      GÖREV: Aşağıdaki farklı ajanlardan gelen çıktıları tutarlı, uygulanabilir ve ultra-pedagojik bir eğitim blueprint'ine dönüştür.
      
      AJAN ÇIKTILARI:
      ${outputs}
      
      ENTEGRASYON KURALLARI:
      1. Tutarlılık: Görsel öneriler ile içerik birbiriyle %100 uyumlu olmalı.
      2. Uygulanabilirlik: Belirlenen değerlendirme kriterleri, içerik adımlarıyla örtüşmeli.
      3. Pedagojik Not: Öğretmen için bu etkinliğin "neden" yapıldığına dair derinlemesine bir açıklama ekle.
      
      Yanıtını JSON formatında 'blueprint' objesi olarak döndür.
    `;
  }

  protected toPedagogicalNote(): string {
    return 'Birlesik cikti ogretmene tutarli bir uygulama akisi sunar.';
  }
}
