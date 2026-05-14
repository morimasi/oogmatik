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
    const puzzleCount = options.itemCount || 10; // Hızlı mod ve premium uyumu için artırıldı

    const prompt = `
Sen "Zeka ve Mantık Oyunları" alanında uzman bir eğitmensin.
Disleksi ve DEHB dostu, bilişsel yükü dengelenmiş ama içerik olarak DOPDOLU bir çalışma sayfası üretmelisin.
Boşluk bırakmaktan kaçın, sayfayı zenginleştir.

GÖREV: ${puzzleCount} adet birbirinden farklı, yüksek kaliteli Türkçe zeka sorusu üret.

PARAMETRELER:
- Konu: ${topic}
- Zorluk: ${difficulty}
- Yaş Grubu: ${options.ageGroup || '8-10'}

SORU TİPLERİ (ZENGİN KARIŞIM):
- Kelime Oyunları (Bilmeceler, harf yer değiştirme)
- Yanal Düşünme (Lateral Thinking - şaşırtmacalı mantık)
- Sayısal Zeka (Basit örüntüler, görsel matematik paradoksları)
- Görsel Mantık (Emoji bilmeceleri, şekil dizileri)

TASARIM KURALLARI:
- Her soru için mutlaka bir "hint" (ipucu) ekle.
- "visual" alanına soruyu betimleyen 1-2 emoji ekle.
- Çıktı sadece JSON formatında olmalı.

ZORUNLU JSON ÇIKTISI:
{
    "id": "bt_uuid",
    "activityType": "BRAIN_TEASERS",
    "title": "Kafayı Çalıştır: Zeka ve Mantık Atölyesi",
    "instruction": "Aşağıdaki gizemleri çözmek için yaratıcılığını kullan. Her bir soru seni farklı bir düşünme biçimine davet ediyor!",
    "difficultyLevel": "${difficulty}",
    "ageGroup": "${options.ageGroup || '8-10'}",
    "puzzles": [
        {
            "id": "p1",
            "type": "riddle",
            "category": "Dil",
            "difficulty_stars": 2,
            "q": "Soru metni",
            "hint": "Küçük bir ipucu",
            "visual": "🧩",
            "a": "Cevap"
        }
    ]
}
    `;

    const parsedData = await generateCreativeMultimodal({
      prompt: prompt,
      temperature: 0.7
    });

    const result = {
      ...parsedData,
      id: parsedData.id || crypto.randomUUID(),
      activityType: ActivityType.BRAIN_TEASERS,
    };

    return [result] as any;
  }
}

// Standalone function for registry compatibility
export const generateBrainTeasersFromAI = async (options: GeneratorOptions): Promise<WorksheetData> => {
  const generator = new BrainTeasersGenerator();
  const res = await generator.generate(options);
  return res as WorksheetData;
};
