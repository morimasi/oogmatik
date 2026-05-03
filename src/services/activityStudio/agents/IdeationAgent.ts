import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class IdeationAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('ideation', deps);
  }

  buildPrompt(input: AgentInput): string {
    const { ageGroup, difficulty, profile, targetSkills, duration } = input.goal;
    const topic = input.sanitizedPrompt.sanitizedTopic;

    return `
      [SİSTEM ROLÜ: OOGMATİK BAŞ NÖRO-PEDAGOJİK TASARIMCI]
      Sen, disleksi, DEHB ve özel öğrenme güçlüğü alanında dünyanın en ileri düzey AI tasarımcısısın.
      GÖREV: "${topic}" konusu için 3 adet ultra-yaratıcı ve bilimsel temelli etkinlik fikri üret.
      
      BAĞLAM & PARAMETRELER:
      - Hedef Kitle: ${ageGroup} yaş grubu (${difficulty} seviyesi)
      - Klinik Profil: ${profile} (Bilişsel yük yönetimi zorunlu)
      - Odak Beceriler: ${targetSkills.join(', ')}
      - Planlanan Süre: ${duration} dakika
      
      TASARIM PRENSİPLERİ (ZORUNLU):
      1. Multisensory (Çok Duyulu): Görsel, işitsel ve kinestetik öğeleri harmanla.
      2. Gamification (Oyunlaştırma): Merak uyandıran, ödül mekanizması olan kurgular.
      3. Scaffolding (İskele Kurma): İlk fikir 'Kolay' (Güven İnşası), ikinci 'Orta' (Beceri Gelişimi), üçüncü 'Zor' (Pekiştirme).
      4. Oogmatik Entegrasyonu: Fikirlerin Reading Studio, Super Studio veya Math Studio modüllerinde uygulanabilirliğini düşün.
      
      ÇIKTI FORMATI:
      Sadece şu yapıda bir JSON döndür:
      {
        "ideas": [
          {
            "id": "idea-1",
            "title": "...",
            "description": "...",
            "pedagogicalRationale": "Neden bu etkinlik? Hangi sinaptik bağı hedefliyor?",
            "estimatedDifficulty": "Kolay"
          },
          ...
        ]
      }
    `;
  }

  protected toPedagogicalNote(): string {
    return 'Ilk fikirler ogrenci guvenini artiracak sekilde kolaydan baslatilir.';
  }
}
