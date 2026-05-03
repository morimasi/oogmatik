import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class ContentAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('content', deps);
  }

  buildPrompt(input: AgentInput): string {
    const { topic, targetSkills, ageGroup, difficulty, profile } = input.goal;
    
    return `
      [SİSTEM ROLÜ: OOGMATİK KIDEMLİ ÖZEL EĞİTİM YAZARI]
      GÖREV: "${topic}" konusu için disleksi/ADHD hassasiyetli, yüksek kaliteli eğitim içeriği üret.
      
      PEDAGOJİK SINIRLAR:
      - Hedef Beceriler: ${targetSkills.join(', ')}
      - Klinik Profil: ${profile}
      - Seviye: ${ageGroup} Yaş / ${difficulty} Zorluk
      
      YAZIM KURALLARI (ZORUNLU):
      1. Dil Seviyesi: Teknik terimlerden kaçın, öğrencinin ZPD (Yakınsal Gelişim Alanı) ile uyumlu konuş.
      2. Disleksi Dostu Metin: Kısa cümleler (max 12 kelime), net yönergeler.
      3. Görsel Betimleme: Metinler içinde soyut kavramları somutlaştıran örnekler kullan.
      4. Aktif Katılım: Sadece okutma, soru sorarak veya uygulama yaptırarak etkileşim kur.
      5. Lexend Uyumu: Font yapısına uygun, karmaşık heceleme yapılarından kaçınan kelime seçimi.
      
      ÇIKTI YAPISI:
      {
        "blocks": [
          {
            "type": "instruction | text | example | activity_step | key_point",
            "content": "...",
            "metadata": { "highlight": "Vurgulanacak kelime/harf", "pedagogicalNote": "Öğretmen için not" }
          }
        ]
      }
    `;
  }

  protected toPedagogicalNote(input: AgentInput): string {
    return `${input.goal.targetSkills.join(', ')} becerileri icin adimli icerik iskeleleme saglar.`;
  }
}
