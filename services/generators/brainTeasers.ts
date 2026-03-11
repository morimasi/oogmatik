import { ActivityType, GeneratorOptions, WorksheetData } from '../../types';
import { BaseGenerator } from './core/BaseGenerator';

export class BrainTeasersGenerator extends BaseGenerator<any> {
  constructor() {
    super();
  }

  protected async execute(options: GeneratorOptions): Promise<WorksheetData> {
    // AI Generator implementation
    const prompt = `
            Lütfen bir "Zeka ve Mantık Oyunları" çalışma kağıdı oluştur.
            
            Konu: ${options.topic || 'Genel Mantık'}
            Zorluk: ${options.difficulty}
            Soru Tipi: ${options.questionStyle || 'mixed'}
            
            Çıktı Formatı (JSON):
            {
                "puzzles": [
                    {
                        "type": "riddle" | "logic_grid" | "pattern" | "math_trick",
                        "question": "Soru metni",
                        "visualData": "Gerekirse görsel verisi (ASCII veya SVG path)",
                        "answer": "Cevap",
                        "hint": "İpucu"
                    }
                ]
            }
        `;

    // Mock response
    return {
      title: 'Kafayı Çalıştır',
      instruction: 'Soruları dikkatlice oku ve mantığını kullanarak çöz.',
      layoutArchitecture: {
        blocks: [
          {
            type: 'puzzles',
            content: {
              items: [
                {
                  type: 'riddle',
                  q: 'Benim şehirlerim var ama evlerim yok. Dağlarım var ama ağaçlarım yok. Sularım var ama balıklarım yok. Ben neyim?',
                  a: 'Harita',
                },
                {
                  type: 'math_trick',
                  q: 'Bir sepette 5 elma var. 5 çocuğa birer elma verdin ama sepette hala bir elma kaldı. Bu nasıl mümkün oldu?',
                  a: 'Son çocuğa elmayı sepetle birlikte verdin.',
                },
                {
                  type: 'pattern',
                  q: 'Sıradaki şekil hangisi olmalı? 🟥 🟦 🟥 🟦 ...',
                  a: '🟥',
                },
              ],
            },
          },
        ],
      },
    } as any;
  }
}
