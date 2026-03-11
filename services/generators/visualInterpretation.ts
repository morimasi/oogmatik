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

    const prompt = `Sen "Disleksi ve Özel Öğrenme Güçlüğü" alanında uzman, nöro-pedagojik görsel algı testleri hazırlayan kıdemli bir eğitim tasarımcısısın.
Görev: Öğrencinin görsel detayları fark etme, 5N1K analizi yapma ve mantıksal çıkarım (inference) yeteneklerini geliştiren ultra-profesyonel bir "Resim Yorumlama ve Analiz" etkinliği üretmek.

AYARLAR:
- Konu/Tema: "${topic}" (Örn: daily_life, nature, city, fantasy...)
- Görsel Stili: "${visualStyle}" (Bu stilde bir resim üretilmesi için DALL-E / Midjourney kalitesinde muazzam detaylı İngilizce prompt yazacaksın)
- Soru Zorluğu: "${difficulty}" (Zorluk seviyesi arttıkça sorular daha soyut, çıkarıma ve gizli detaylara dayalı olmalı)
- Soru Sayısı: ${itemCount} adet soru
- Soru Tipi: "${questionStyle}" (mixed = hem test hem açık uçlu, sadece open_ended vs.)
${studentCtx}

AŞAMA 1: GÖRSEL PROMPTU (SCENE DESCRIPTION)
Lütfen seçilen konuya uygun, içinde en az 5-6 mantıksal ilişkinin veya gizli detayın olduğu çok zengin, hareketli bir sahne hayal et.
"imagePrompt" alanına, yapay zekanın bu resmi kusursuz çizebilmesi için İNGİLİZCE çok detaylı bir image generation prompt'u yaz. (Örn: "A highly detailed, ${visualStyle} style illustration of a busy city park. In the foreground, a golden retriever is jumping to catch a red frisbee..."). Bu görselde soracağın soruların cevapları KESİNLİKLE bulunmalı.

AŞAMA 2: SORULAR VE PEDAGOJİK ANALİZ
Verdiğin görsel tasvire %100 sadık kalarak, çocuğun görseldeki durumları analiz etmesini sağlayacak ${itemCount} adet soru hazırla.

JSON ÇIKTI FORMATI: (Lütfen sadece geçerli JSON döndür, markdown veya başka metin kullanma)
{
    "id": "visual_int_uuid",
    "activityType": "VISUAL_INTERPRETATION",
    "title": "Görselin İlgi Çekici Türkçe Başlığı",
    "instruction": "Kullanıcıya/Öğrenciye yönerge (Örn: Resmi bir dedektif gibi incele ve soruları cevapla.)",
    "layoutArchitecture": {
        "blocks": [
            {
                "type": "image",
                "content": {
                    "prompt": "Görsel üretim motorları için İNGİLİZCE detaylı prompt (DALL-E style)",
                    "alt": "Görselin 1-2 cümlelik Türkçe kısa açıklaması"
                }
            },
            {
                "type": "questions",
                "content": {
                    "items": [
                        {
                            "q": "Soru 1 (Örn: Çocuğun elindeki elma ne renkti?)",
                            "type": "multiple", // Veya "open", veya "true_false"
                            "options": ["A", "B", "C"], // Sadece multiple ise dolu olsun, değilse null
                            "answer": "Doğru Cevap"
                        }
                        // ... toplam ${itemCount} soru
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
