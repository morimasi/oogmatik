import { GeneratorOptions, WorksheetData } from '../../types';
import { BaseGenerator } from './core/BaseGenerator';
import { generateCreativeMultimodal } from '../geminiClient';

export class VisualInterpretationGenerator extends BaseGenerator<any> {
  constructor() {
    super();
  }

  protected async execute(options: GeneratorOptions): Promise<WorksheetData> {
    const topic = options.topic || 'daily_life';
    const difficulty = options.difficulty || 'Orta';
    const questionStyle = options.questionStyle || 'mixed';
    const itemCount = options.itemCount || 5;
    const visualStyle = options.visualStyle || 'illustration';
    const student = options.studentContext;

    let studentCtx = '';
    if (student) {
      studentCtx = `Bu etkinlik ${student.age} yaşındaki, ${student.grade}. sınıf öğrencisi ${student.name} isimli çocuk için hazırlanmaktadır. 
            Çocuğun öğrenme stili: ${student.learningStyle}. İçerik onun ilgisini çekecek düzeyde olmalı.`;
    }

    const prompt = `Sen "Disleksi ve Özel Öğrenme Güçlüğü" ve "Nöro-Pedagoji" alanında dünya çapında uzman, üst düzey bir eğitim materyali tasarımcısısın.
Görev: Öğrencinin görsel algı, detay farkındalığı, görsel-mekansal akıl yürütme ve mantıksal çıkarım (inference) yeteneklerini en üst seviyeye taşıyan "Görsel Yorumlama ve Analiz" etkinliği üretmek.

ETKİNLİK PARAMETRELERİ:
- Tema/Konu: "${topic}" 
- Zorluk Seviyesi: "${difficulty}" 
- Görsel Stili: "${visualStyle}"
- Soru Sayısı: ${itemCount}
- Soru Tarzı: "${questionStyle}"

${studentCtx}

AŞAMA 1: ULTRA-DETAYLI GÖRSEL KURGUSU (ULTRA-PREMIUM IMAGE PROMPT)
"imagePrompt" alanına, Midjourney V6 veya DALL-E 3 kalitesinde, muazzam bir İNGİLİZCE prompt yazmalısın. 
Görsel üretim robotuna şu talimatları içerecek şekilde komut ver:
- "Cinematic lighting, hyper-realistic details, 8k, masterwork, vivid colors."
- "Composition: Wide shot, intricate background details that contain hidden educational clues."
- "Focus: ${topic} temalı sahnede, öğrencinin dikkatini çekecek 5 spesifik nesne veya olay kurgula."

AŞAMA 2: PEDAGOJİK SORULAR VE ANALİZ
Sorular, görseldeki spesifik detaylara (Örn: "Duvardaki saatin yelkovanı hangi sayıyı gösteriyor?", "Mavi çantalı çocuk neden şaşkın bakıyor?") odaklanmalıdır.

JSON ÇIKTI FORMATI: (Yalnızca geçerli JSON döndür)
{
    "id": "visual_int_uuid",
    "activityType": "VISUAL_INTERPRETATION",
    "title": "Pedagojik ve İlgi Çekici Başlık",
    "instruction": "Öğrenciye yönelik, motive edici ve net yönerge.",
    "pedagogicalNote": "Bilişsel hedef notu.",
    "layoutArchitecture": {
        "blocks": [
            {
                "type": "image",
                "content": {
                    "prompt": "İNGİLİZCE detaylı görsel üretim promptu",
                    "alt": "Görselin Türkçe kısa betimlemesi"
                }
            },
            {
                "type": "question",
                "content": {
                    "items": [
                        {
                            "q": "Soru metni",
                            "type": "multiple",
                            "options": ["Seçenek A", "Seçenek B", "Seçenek C", "Seçenek D"],
                            "answer": "Doğru Cevap"
                        }
                    ]
                }
            }
        ]
    }
}`;

    // AI'dan üretimi bekle
    const generatedData = await generateCreativeMultimodal({
      prompt: prompt,
      temperature: 0.7
    });

    // Üretilen veriye UUID ekle
    if (generatedData && !generatedData.id) {
      generatedData.id = crypto.randomUUID();
    }

    return generatedData as WorksheetData;
  }
}

export const generateVisualInterpretationFromAI = async (options: GeneratorOptions): Promise<WorksheetData> => {
  const generator = new VisualInterpretationGenerator();
  return generator.generate(options) as Promise<WorksheetData>;
};
