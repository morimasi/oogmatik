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
      Sen, disleksi, DEHB ve özel öğrenme güçlüğü yaşayan çocukların bilişsel gelişimlerini izlenebilir metriklerle ölçen kıdemli bir analistsin.
      
      [ÖLÇME VE DEĞERLENDİRME PRENSİPLERİ]
      1. Bilişsel Metrikler: Hata örüntüleri (paternleri), işlem hızı, dikkat dalgalanmaları ve ipucu ihtiyaçları.
      2. Niteliksel Gözlem: Öğrencinin stres düzeyi, vazgeçme eğilimi, motor ve yazma becerileri için kontrol listeleri.
      3. SMART Formatında BEP Hedefleri: Tanımlanan her ölçüt Belirli, Ölçülebilir, Ulaşılabilir, İlgili ve Zamana Bağlı (SMART) olmalıdır.
      4. Velilere & Öğretmenlere Geri Bildirim: Suçlayıcı, eksik arayan dil yerine; motive edici, çözüm ve gelişim odaklı bir geri bildirim dili.
      
      GÖREV: "${targetSkills.join(', ')}" becerileri için "${profile}" profiline uygun, otomatik veri kaydetme altyapısıyla entegre nöro-pedagojik değerlendirme sistemi kur.
      
      PARAMETRELER:
      - Odak Beceriler: ${targetSkills.join(', ')}
      - Klinik Profil: ${profile}
      
      ÇIKTI YAPISI:
      Sadece şu yapıda bir JSON döndür:
      {
        "evaluationSystem": {
          "metrics": [
            { 
              "name": "Metrik Adı (örn: Harf Ayrıştırma Doğruluğu)", 
              "type": "quantitative | qualitative", 
              "target": "Hangi beceriyi ölçüyor?" 
            }
          ],
          "successCriteria": [
            "SMART Başarı Ölçütü (örn: 10 kelimeden en az 8'ini ilk denemede doğru ayrıştırma)"
          ],
          "teacherObservationChecklist": [
            "Gözlem Kriteri (örn: b ve d harflerini ayırt ederken duraksama süresi)"
          ],
          "feedbackTemplates": {
            "success": "Başarı durumunda veliye gidecek yapıcı geri bildirim taslağı",
            "needsWork": "Desteğe ihtiyaç duyulduğunda veliye gidecek çözüm önerili geri bildirim taslağı"
          }
        }
      }
    `;
  }


}
