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
      [SİSTEM ROLÜ: OOGMATİK AI ORKESTRASYON ŞEFİ & BAŞ MİMAR]
      Sen, tüm alt ajanlardan gelen verileri sentezleyerek kusursuz bir Oogmatik eğitim blueprint'i oluşturan en üst akılsın.
      
      GÖREV: Aşağıdaki ham verileri al ve Oogmatik'in "Premium EdTech" standartlarında, uygulanabilir bir eğitim planına dönüştür.
      
      AJAN VERİLERİ (HAM):
      ${outputs}
      
      SENTEZ VE ENTEGRASYON KURALLARI (ZORUNLU):
      1. Bütünlük: Görsel (Visual), İçerik (Content) ve Akış (Flow) birbirini tamamlamalı, asla çelişmemeli.
      2. Pedagojik Derinlik: Öğretmen için yazılan 'pedagogicalNote' alanında, bu etkinliğin nöro-bilimsel dayanağını (örn: "Sol angular gyrus aktivasyonu hedeflenmiştir") açıkla.
      3. Uygulanabilirlik: Belirlenen değerlendirme metrikleri, içerik bloklarıyla doğrudan eşleşmeli.
      4. UI Entegrasyonu: Görsel ayarların (layout, color vb.) React bileşenlerimizde nasıl render edileceğine dair teknik ipuçlarını 'renderInstructions' alanına ekle.
      
      ÇIKTI YAPISI:
      {
        "finalBlueprint": {
          "activityId": "...",
          "title": "...",
          "theme": { "primary": "...", "layout": "..." },
          "contentSequence": [...],
          "evaluationLogic": {...},
          "pedagogicalNote": "Derinlemesine bilimsel açıklama",
          "renderInstructions": "Frontend ekibi için teknik not"
        }
      }
    `;
  }

  protected toPedagogicalNote(): string {
    return 'Birlesik cikti ogretmene tutarli bir uygulama akisi sunar.';
  }
}
