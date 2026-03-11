import { ActivityType, GeneratorOptions, WorksheetData } from '../../types';
import { BaseGenerator } from './core/BaseGenerator';

export class VisualInterpretationGenerator extends BaseGenerator<any> {
  constructor() {
    super();
  }

  protected async execute(options: GeneratorOptions): Promise<WorksheetData> {
    // AI Generator implementation
    // This will construct a prompt for Gemini to generate a visual description and related questions

    const prompt = `
            Lütfen bir "Görsel Yorumlama ve Analiz" etkinliği oluştur.
            
            Konu: ${options.topic || 'Genel Yaşam'}
            Zorluk: ${options.difficulty}
            Soru Tipi: ${options.questionStyle || 'mixed'}
            
            Çıktı Formatı (JSON):
            {
                "sceneDescription": "Dall-E veya benzeri bir araç için detaylı sahne betimlemesi (İngilizce)",
                "sceneDescriptionTR": "Sahnenin Türkçe detaylı anlatımı (Öğrenci görmeyecek, öğretmen için)",
                "questions": [
                    {
                        "type": "open_ended" | "multiple_choice" | "true_false",
                        "text": "Soru metni",
                        "options": ["A", "B", "C"] (sadece çoktan seçmeli için),
                        "answer": "Doğru cevap",
                        "hint": "İpucu"
                    }
                ]
            }
        `;

    // Mock response structure for now, real implementation would call AI service
    return {
      title: options.topic || 'Resim Yorumlama',
      instruction: 'Aşağıdaki görseli dikkatlice inceleyin ve soruları cevaplayın.',
      layoutArchitecture: {
        blocks: [
          {
            type: 'image',
            content: {
              prompt:
                'A detailed illustration of a busy city park with children playing, a dog chasing a ball, and an ice cream vendor.',
              alt: 'Şehir parkı sahnesi',
            },
          },
          {
            type: 'questions',
            content: {
              items: [
                { q: 'Parkta kaç çocuk oyun oynuyor?', type: 'open' },
                {
                  q: 'Dondurmacının şemsiyesi ne renk?',
                  type: 'multiple',
                  options: ['Kırmızı', 'Mavi', 'Sarı'],
                },
              ],
            },
          },
        ],
      },
    } as any;
  }
}
