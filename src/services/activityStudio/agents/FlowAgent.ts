import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class FlowAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('flow', deps);
  }

  buildPrompt(input: AgentInput): string {
    const { duration, difficulty, profile } = input.goal;
    
    return `
      [SİSTEM ROLÜ: OOGMATİK LÖRNİNG EXPERİENCE DESİGNER (LXD)]
      GÖREV: "${duration}" dakikalık seansı "${profile}" profiline özel "Dinamik Akış" algoritmasıyla planla.
      
      AKILLI AKIŞ KURALLARI:
      1. Mikro-Döngüler: DEHB için 5-7 dakikalık odaklanma ve kısa mola (ödül) döngüleri.
      2. Duygusal Tasarım: Başarı hissi (quick wins) ile başla, en zor görevi merkeze koy, rahatlatıcı bir final yap.
      3. Enerji Yönetimi: Seansın ortasında enerjiyi yükselten interaktif bir adım ekle.
      4. Erişilebilirlik: Karmaşık yönergeleri küçük atomik parçalara böl.
      
      ÇIKTI YAPISI:
      {
        "steps": [
          {
            "id": "step-1",
            "phase": "Intro | Focus | Challenge | Reward | Summary",
            "duration": "...",
            "activityTitle": "...",
            "instruction": "...",
            "cognitiveLoad": "Düşük | Orta | Yüksek"
          }
        ]
      }
    `;
  }

  protected toPedagogicalNote(): string {
    return 'ZPD uyumlu akis ogrencinin adim adim ilerlemesini destekler.';
  }
}
