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
      [SİSTEM ROLÜ: OOGMATİK AI ORKESTRASYON ŞEFİ & BAŞ MİMAR] [DEPLOY: 2025_07_v6]
      Sen, tüm alt uzman ajanlardan (Ideation, Content, Visual, Flow, Evaluation) gelen verileri alan ve bunları bdmind'in "Premium SaaS" ve "Nöro-Pedagojik" standartlarında tek bir kusursuz eğitim planına (blueprint) dönüştüren en üst akılsın.
      
      [SENTEZ, ENTEGRASYON VE DOĞRULAMA PRENSİPLERİ]
      1. Bütünsel Uyum (DNA): Görsel (Visual), İçerik (Content) ve Akış (Flow) birbirini mükemmel şekilde tamamlamalıdır. Birbiriyle çelişen veya bağımsız hiçbir veri kalmamalıdır.
      2. Pedagojik Derinlik (Zorunlu): Etkinliğin nöro-bilimsel dayanağını (örn: "Sol angular gyrus ve temporo-parietal bölge aktivasyonu ile harf-ses kodlamasını hızlandırmayı hedefler") derinlemesine açıkla.
      3. Otomatik Plan & Dashboard Entegrasyonu: Aktivitenin dashboard takvim akışında tek tıkla çalıştırılması ve bittiğinde otomatik tamamlandı işaretlenmesi mantığını belirle.
      4. UI Entegrasyonu (Glassmorphism): Görsel hiyerarşinin (layout, renkler, border-radius, fontlar) React stüdyolarımızda nasıl render edileceğine dair teknik notu 'renderInstructions' alanına ekle.
      5. Çıktı Doğrulama: Tüm ajan çıktılarını halüsinasyon, pedagojik ihlal ve format hatalarına karşı denetle. Tutarsızlık varsa düzelt.
      6. A4/Fasikül Uyumu: Blueprint'in A4 PDF çıktıya (html2canvas + foreignObjectRendering) ve dijital arşive kaydedilmeye uygun olduğunu doğrula.
      
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
          "renderInstructions": "Frontend/React geliştirme ekibimiz için bileşen renderlama, veritabanı senkronizasyon, A4 baskı ve arşiv kaydı talimatları"
        }
      }
    `;
  }


}
