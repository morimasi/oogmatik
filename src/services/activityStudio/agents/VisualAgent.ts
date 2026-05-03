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
      GÖREV: "${topic}" temalı etkinlik için "${profile}" profiline uygun görsel hiyerarşi ve tasarım sistemi oluştur.
      
      TASARIM KURALLARI (ZORUNLU):
      1. Renk Psikolojisi: "${profile}" (Disleksi/DEHB) için dikkat dağıtmayan, düşük doygunluklu ama kontrastlı renkler.
      2. Odak Yönetimi: Ekranın en önemli alanını (CTA) belirle ve görsel ağırlığı oraya ver.
      3. Bilişsel Yük: Tek seferde 3'ten fazla görsel uyaran olmamalı.
      4. İkonografi: Somut, evrensel ve Lexend fontu ile uyumlu minimalist ikonlar.
      5. Layout: Glassmorphism (2.5rem radius, blur) standartlarını koruyan kutulama sistemi.
      
      ÇIKTI YAPISI:
      {
        "visualSettings": {
          "primaryColor": "...",
          "secondaryColor": "...",
          "layoutType": "grid | focus | list",
          "spacing": "relaxed | standard",
          "visualElements": ["...", "..."],
          "accessibilityNote": "Görsel erişilebilirlik için kritik uyarı"
        }
      }
    `;
  }

  protected toPedagogicalNote(): string {
    return 'Gorsel destekler bilissel yuku azaltir ve odaklanmayi artirir.';
  }
}
