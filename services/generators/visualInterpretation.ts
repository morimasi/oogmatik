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
- Tema/Konu: "${topic}" (Görsel bu tema üzerinde yoğunlaşmalı)
- Zorluk Seviyesi: "${difficulty}" 
  * Başlangıç: Somut, doğrudan görünen nesneler ve basit ilişkiler.
  * Orta: Mekansal konumlar, renk-biçim detayları ve basit neden-sonuç.
  * Zor: Soyut kavramlar, gizli detaylar, duygusal ifadeler ve karmaşık mantıksal hatalar.
  * Uzman: Paradokslar, çok katmanlı hikayeler ve derin çıkarım gerektiren görsel ipuçları.
- Görsel Stili: "${visualStyle}" (Örn: hyper-realistic, digital art, watercolor, flat design)
- Soru Sayısı: ${itemCount}
- Soru Tarzı: "${questionStyle}"

AŞAMA 1: ULTRA-DETAYLI GÖRSEL KURGUSU (IMAGE PROMPT)
"imagePrompt" alanına, DALL-E 3 veya Midjourney V6 kalitesinde, her pikseli düşünülmüş muazzam bir İNGİLİZCE prompt yazmalısın.
Prompt şunları içermeli:
- Işıklandırma (Örn: cinematic lighting, golden hour, soft studio light)
- Kompozisyon (Örn: wide angle, rule of thirds, top-down view)
- Detay Yoğunluğu (Örn: ultra-detailed, 8k resolution, intricate textures)
- Mantıksal Katmanlar: Görselde soracağın her sorunun cevabı mutlaka görseldeki bir detayda (nesnenin rengi, birinin bakış yönü, duvardaki bir saatin saati vb.) gizli olmalı.

AŞAMA 2: PEDAGOJİK SORULAR VE ANALİZ
Sorular sadece "ne görüyorsun?" şeklinde olmamalı; "şu kişi neden oraya bakıyor olabilir?", "görseldeki hangi nesne fizik kurallarına aykırı?" gibi derinlik içermeli.

JSON ÇIKTI FORMATI: (Yalnızca geçerli JSON döndür)
{
    "id": "visual_int_uuid",
    "activityType": "VISUAL_INTERPRETATION",
    "title": "Pedagojik ve İlgi Çekici Başlık",
    "instruction": "Öğrenciye yönelik, motive edici ve net yönerge.",
    "pedagogicalNote": "Bu etkinliğin hangi bilişsel beceriyi (Örn: Görsel ayırım, şekil-zemin algısı) hedeflediğine dair kısa bir uzman notu.",
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
                            "type": "multiple", // Veya "open"
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
