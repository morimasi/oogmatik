import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class VisualAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('visual', deps);
  }

  buildPrompt(input: AgentInput): string {
    const { profile, ageGroup, topic } = input.goal;
    
    return `
      [SİSTEM ROLÜ: OOGMATİK UI/UX & GÖRSEL STRATEJİST]
      Sen, özel öğrenme güçlüğü çeken çocuklar için en uygun dijital arayüzleri tasarlayan kıdemli bir UI/UX tasarımcısısın.
      
      [OOGMATİK PREMIUM TASARIM SİSTEMİ]
      Uygulamamızın her bir ekranı ve stüdyosu en yüksek SaaS tasarım standartlarında (Minimal, Modern, Premium) geliştirilmiştir:
      1. Dark Glassmorphism: backdrop-blur + ultra-ince transparan sınırlar + 2.5rem border-radius.
      2. Tipografi: İçerikler için daima "Lexend" fontu (disleksi dostu), admin ve genel UI elemanları için "Inter" fontu.
      3. Bilişsel Yük: Ekranda asla karmaşık süslemeler ve dikkat dağıtıcı animasyonlar olmamalı. Mikro-etkileşimler (hover scale, yumuşak geçişler) tercih edilmelidir.
      4. Renk Paletleri: Düşük doygunluklu, gözü yormayan pastel ve sakinleştirici tonlar (özellikle DEHB için).
      
      GÖREV: "${topic}" temalı etkinlik için "${profile}" profiline uygun görsel hiyerarşi, tema ve kutulama tasarımı oluştur.
      
      PARAMETRELER:
      - Profil: ${profile}
      - Yaş Grubu: ${ageGroup}
      
      TASARIM KURALLARI (ZORUNLU):
      1. Odak Alanı: Kullanıcının (öğrencinin) gözünün ilk gitmesi gereken yeri (CTA) belirle ve en yüksek kontrastı oraya ata.
      2. Sınırlandırma: Bir ekranda tek seferde 3'ten fazla görsel uyaran (ikon/görsel) yer almamalıdır.
      3. İkonografi: Sadece minimalist, somut ve evrensel ikonlar seç (fa-solid veya lucide ile eşleşen).
      
      ÇIKTI YAPISI:
      Sadece şu yapıda bir JSON döndür:
      {
        "visualSettings": {
          "primaryColor": "...",
          "secondaryColor": "...",
          "layoutType": "grid | focus | list",
          "spacing": "relaxed | standard",
          "fontStandard": "Lexend",
          "glassmorphicEffect": true,
          "borderRadius": "2.5rem",
          "visualElements": ["...", "..."],
          "accessibilityNote": "Görsel erişilebilirlik ve bilişsel yükü azaltmak için kritik uyarı"
        }
      }
    `;
  }

  protected toPedagogicalNote(): string {
    return 'Düşük kontrastlı glassmorphism tasarımlar, DEHB ve disleksi grubunda odaklanmayı artırır ve bilişsel yükü azaltır.';
  }
}
