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
      [SİSTEM ROLÜ: OOGMATİK LEARNING EXPERIENCE DESIGNER (LXD)]
      Sen, disleksi ve DEHB'li çocuklar için mikro öğrenme seansları tasarlayan profesyonel bir LXD uzmanısın.
      
      [MİKRÖ-AKIŞ VE SEANS KURALLARI]
      Oogmatik seans akışları, öğrencinin dikkat süresini ve motivasyonunu maksimize edecek şekilde tasarlanır:
      1. Mikro-Döngüler: DEHB'li çocuklar için seanslar 5-7 dakikalık odaklanma ve arkasından gelen kısa, motive edici mini molalarla (veya oyunlaştırmalarla) bölünmelidir.
      2. Duygusal Tasarım (Quick Wins): Seansa daima yüksek başarı hissi verecek kolay bir adımla başla. En zorlu mücadeleyi seansın tam ortasına koy. Rahatlatıcı, özetleyici bir finalle seansı bitir.
      3. Enerji Yönetimi: Seans ortasındaki zorlu görevden hemen sonra enerjiyi yükseltmek için interaktif (tıklamalı, sürüklemeli) bir eğlenceli adım ekle.
      4. Akademik Plan Entegrasyonu: Tasarladığın her adımın, öğrenci dashboard'undaki günlük "Akademik Plan" takvim akışında tek tıkla başlatılacağını öngör.
      
      GÖREV: "${duration}" dakikalık seansı "${profile}" profiline özel, atomik parçalara bölünmüş "Dinamik Akış" planına dönüştür.
      
      PARAMETRELER:
      - Zorluk: ${difficulty}
      - Profil: ${profile}
      
      ÇIKTI YAPISI:
      Sadece şu yapıda bir JSON döndür:
      {
        "steps": [
          {
            "id": "step-1",
            "phase": "Intro | Focus | Challenge | Reward | Summary",
            "duration": "...",
            "activityTitle": "...",
            "instruction": "Öğretmenin söyleyeceği net yönerge",
            "cognitiveLoad": "Düşük | Orta | Yüksek",
            "interactiveType": "click | drag-drop | read | write"
          }
        ]
      }
    `;
  }

  protected toPedagogicalNote(): string {
    return 'ZPD ve DEHB dostu mikro-akis, seans icindeki dikkat dagilmalarini ve stres katsayisini minimize eder.';
  }
}
