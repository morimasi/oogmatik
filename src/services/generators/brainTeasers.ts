import { generateCreativeMultimodal } from '../geminiClient';
import { ActivityType, GeneratorOptions, WorksheetData } from '../../types';
import { BaseGenerator } from './core/BaseGenerator';

export class BrainTeasersGenerator extends BaseGenerator<WorksheetData> {
  constructor() {
    super();
  }

  protected async execute(options: GeneratorOptions): Promise<WorksheetData> {
    const difficulty = options.difficulty || 'Orta';
    const topic = options.topic || 'Genel Mantık';
    const puzzleCount = options.puzzleCount || 6;

    const prompt = `
Sen "Zeka ve Mantık Oyunları" alanında uzman bir eğitmensin.
${puzzleCount} farklı, Türkçe zeka sorusu üret.

PARAMETRELER:
- Konu: ${topic}
- Zorluk: ${difficulty}
- Yaş Grubu: Genel (8-13)

SORU TİPLERİ (Her kategoriden en az 1 tane):
- Dil (word_riddle, riddle): Kelime bulmaca, sözcük bilmecesi
- Mantık (lateral_thinking): Yanal düşünme, kurgu çözümleme
- Sayı (visual_math): Sayı örüntüsü, matematiksel paradoks
- Görsel (sequence_find): Şekil dizisi, görsel örüntü bulma

ZORUNLU JSON ÇIKTISI:
{
    "id": "bt_uuid",
    "activityType": "BRAIN_TEASERS",
    "title": "Kafayı Çalıştır: Zeka Oyunları",
    "instruction": "Soruları dikkatlice oku ve yaratıcı düşünerek çöz.",
    "pedagogicalNote": "Bu etkinlik lateral düşünme, çalışma belleği ve sözel akıl yürütme becerilerini geliştirir.",
    "difficultyLevel": "${difficulty}",
    "ageGroup": "8-10",
    "profile": "adhd",
    "puzzles": [
        {
            "id": "p1",
            "type": "riddle",
            "category": "Dil",
            "difficulty_stars": 2,
            "q": "Soru metni",
            "hint": "Küçük bir ipucu",
            "visual": null,
            "a": "Cevap"
        }
    ]
}
    `;

    const parsedData = await generateCreativeMultimodal({
      prompt: prompt,
      temperature: 0.7
    });

    return {
      ...parsedData,
      id: parsedData.id || crypto.randomUUID(),
      activityType: ActivityType.BRAIN_TEASERS,
    } as unknown as WorksheetData;
  }
}
