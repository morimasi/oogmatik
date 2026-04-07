import { GeneratorOptions, WorksheetData } from '../../types';
import { BaseGenerator } from './core/BaseGenerator';
import { generateCreativeMultimodal } from '../geminiClient';

export class VisualInterpretationGenerator extends BaseGenerator<WorksheetData> {
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

AŞAMA 1: imagePrompt alanına ${visualStyle === 'illustration' ? 'educational flat illustration for children, bright colors, detailed scene, Pixar style' : visualStyle === 'cartoon' ? 'colorful cartoon scene for children, fun characters' : 'detailed educational diagram with labels'} formatında İNGİLİZCE prompt yaz. Prompt şunları içermeli:
- "${topic}" teması ve eğitici içerik
- Öğrencinin dikkatini çekecek 5 spesifik nesne veya olay
- Çocuk dostu, uygun görsel unsurlar

AŞAMA 2: PEDAGOJİK SORULAR VE 5N1K ANALİZİ
Sorular, görseldeki spesifik detaylara odaklanmalı ve şu 5N1K yapısını mutlaka içermelidir:
- KİM: Görseldeki karakterlerin kimliği veya rolleri.
- NE: Gerçekleşen olay veya nesnelerin işlevi.
- NEREDE: Mekan analizi ve konum ipuçları.
- NE ZAMAN: Zaman dilimi, mevsim veya günün saati ipuçları.
- NASIL/NİÇİN: Olayların oluş biçimi ve karakterlerin duygu durumları/motivasyonları.

Sorular disleksi dostu, kısa ve net olmalıdır.

JSON ÇIKTI FORMATI: (Yalnızca geçerli JSON döndür)
{
    "id": "visual_int_uuid",
    "visualStyle": "${visualStyle}",
    "difficultyLevel": "${difficulty}",
    "activityType": "VISUAL_INTERPRETATION",
    "title": "Pedagojik ve İlgi Çekici Başlık",
    "instruction": "Öğrenciye yönelik, motive edici ve net yönerge.",
    "pedagogicalNote": "Bu etkinlikte görsel algı ve analitik düşünme becerileri hedeflenir. [Spesifik beceri açıklaması]",
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

    // Görsel üretimini dene
    const blocks = (generatedData as Record<string, unknown>)?.layoutArchitecture as Record<string, unknown> | undefined;
    const blockList = blocks?.blocks as Record<string, unknown>[] | undefined;
    const imageBlock = blockList?.find(b => b.type === 'image');
    if (imageBlock && (imageBlock.content as Record<string, unknown>)?.prompt) {
      try {
        const imgResponse = await fetch('/api/ai/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: (imageBlock.content as Record<string, unknown>).prompt,
            style: options.visualStyle || 'illustration'
          })
        });
        if (imgResponse.ok) {
          const imgData = await imgResponse.json() as { base64?: string };
          if (imgData.base64) {
            (imageBlock.content as Record<string, unknown>).base64 = imgData.base64;
          }
        }
      } catch {
        // görsel opsiyonel; hata sessizce geç
      }
    }

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
