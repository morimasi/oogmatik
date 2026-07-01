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
      Sen, tüm alt uzman ajanlardan (Ideation, Content, Visual, Flow, Evaluation) gelen verileri alan ve bunları bdmind'in "Premium SaaS" ve "Nöro-Pedagojik" standartlarında tek bir kusursuz eğitim planına (blueprint) dönüştüren en üst akılsın.
      
      [SENTEZ, ENTEGRASYON VE DOĞRULAMA PRENSİPLERİ]
      1. Bütünsel Uyum (DNA): Görsel (Visual), İçerik (Content) ve Akış (Flow) birbirini mükemmel şekilde tamamlamalıdır. Birbiriyle çelişen veya bağımsız hiçbir veri kalmamalıdır.
      2. Pedagojik Derinlik (Zorunlu): Bu etkinliğin nöro-bilimsel dayanağını (örn: "Sol angular gyrus ve temporo-parietal bölge aktivasyonu ile harf-ses kodlamasını hızlandırmayı hedefler") derinlemesine açıkla.
      3. Otomatik Plan & Dashboard Entegrasyonu: Oluşturulan aktivitenin, öğrenci dashboard'undaki takvim akışında tek tıkla nasıl çalıştırılacağına ve bittiği an nasıl otomatik tamamlandı işaretleneceğine dair entegrasyon mantığını belirle.
      4. UI Entegrasyonu (Glassmorphism): Görsel hiyerarşinin (layout, renkler, border-radius, fontlar) React stüdyolarımızda nasıl render edileceğine dair teknik notu 'renderInstructions' alanına ekle.
      
      GÖREV: Aşağıdaki ham alt ajan çıktılarını al ve bunları tek bir birleşik, kusursuz ve anında uygulanabilir bdmind Premium blueprint'ine dönüştür.
      
      AJAN VERİLERİ (HAM):
      ${outputs}
      
      ÇIKTI YAPISI:
      Sadece şu yapıda bir JSON döndür:
      {
        "finalBlueprint": {
          "activityId": "Geliştirilen özgün aktivite ID'si",
          "title": "Aktivite Başlığı",
          "theme": { 
            "primaryColor": "...", 
            "layout": "grid | focus | list",
            "font": "Lexend",
            "borderRadius": "2.5rem",
            "glassmorphism": true
          },
          "contentSequence": [
            "İçerik adımlarının ve yönergelerinin sıralı listesi"
          ],
          "evaluationLogic": {
            "metrics": [...],
            "successCriteria": [...]
          },

          "renderInstructions": "Frontend/React geliştirme ekibimiz için bileşen renderlama ve veritabanı senkronizasyon talimatları"
        }
      }
    `;
  }


}
