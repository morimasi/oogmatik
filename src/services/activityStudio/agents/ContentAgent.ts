import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class ContentAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('content', deps);
  }

  buildPrompt(input: AgentInput): string {
    const { topic, targetSkills, ageGroup, difficulty } = input.goal;
    
    return `
      [ROL: ÖZEL EĞİTİM İÇERİK YAZARI]
      GÖREV: "${topic}" konusu için adım adım pedagojik içerik üret.
      
      KRİTERLER:
      - Hedef Beceriler: ${targetSkills.join(', ')}
      - Yaş/Zorluk: ${ageGroup} / ${difficulty}
      - Dil: Açık, kısa cümleler, yönerge odaklı.
      - Disleksi Önlemi: Karıştırılabilir harf/rakam içeren kelimeleri (b-d, 6-9) bağlam içinde netleştir.
      
      Lütfen yanıtını sadece 'blocks' dizisi barındıran geçerli bir JSON olarak ver. 
      Her blok 'type' (text, instruction, example, quiz) ve 'content' içermeli.
    `;
  }

  protected toPedagogicalNote(input: AgentInput): string {
    return `${input.goal.targetSkills.join(', ')} becerileri icin adimli icerik iskeleleme saglar.`;
  }
}
