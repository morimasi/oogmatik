import { generateCreativeMultimodal } from '../geminiClient';
import { ActivityType, GeneratorOptions, WorksheetData } from '../../types';
import { BaseGenerator } from './core/BaseGenerator';

export class BrainTeasersGenerator extends BaseGenerator<any> {
  constructor() {
    super();
  }

  protected async execute(options: GeneratorOptions): Promise<WorksheetData> {
    const difficulty = options.difficulty || 'Orta';
    const topic = options.topic || 'Genel Mantık';
    const puzzleCount = options.puzzleCount || (difficulty === 'Zor' ? 4 : 3);

    const prompt = `
      Sen "Zeka ve Mantık Oyunları" üzerine uzmanlaşmış bir eğitmen ve içerik üreticisisin.
      Öğrencilerin bilişsel becerilerini, problem çözme yeteneklerini ve yanal düşünme (lateral thinking) kapasitelerini geliştirecek ${puzzleCount} farklı zeka sorusu üret.

      PARAMETRELER:
      - Konu: ${topic}
      - Zorluk: ${difficulty}
      - Dil: %100 Türkçe
      
      SORU TİPLERİ (Karışık Üret):
      1. riddle (Mantıksal bilmece)
      2. logic_grid (Basit mantık ızgarası veya sözel çıkarım)
      3. pattern (Sayısal veya görsel örüntü kuralı)
      4. math_trick (Şaşırtıcı matematiksel paradoks veya işlem mantığı)

      ÇIKTI FORMATI (JSON):
      {
          "title": "Kafayı Çalıştır: Zeka Oyunları",
          "instruction": "Soruları dikkatlice oku ve yaratıcı düşünerek çözmeye çalış.",
          "puzzles": [
              {
                  "type": "riddle" | "logic_grid" | "pattern" | "math_trick",
                  "q": "Soru metni",
                  "a": "Cevap",
                  "hint": "Küçük bir ipucu"
              }
          ]
      }
    `;

    const parsedData = await generateCreativeMultimodal({
      prompt: prompt,
      temperature: 0.7
    });

    return {
      title: parsedData.title || 'Kafayı Çalıştır',
      instruction: parsedData.instruction || 'Soruları dikkatlice oku ve mantığını kullanarak çöz.',
      layoutArchitecture: {
        blocks: [
          {
            type: 'puzzles',
            content: {
              items: parsedData.puzzles || []
            },
          },
        ],
      },
    } as any;
  }
}
