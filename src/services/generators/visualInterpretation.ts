import { GeneratorOptions, WorksheetData } from '../../types';
import { BaseGenerator } from './core/BaseGenerator';
import { generateCreativeMultimodal } from '../geminiClient';

export class VisualInterpretationGenerator extends BaseGenerator<WorksheetData> {
  constructor() {
    super();
  }

  protected async execute(options: GeneratorOptions): Promise<WorksheetData> {
    const topic = options.topic || 'çocuklar ve oyun';
    const difficulty = options.difficulty || 'Orta';
    const itemCount = options.itemCount || 10;
    const visualStyle = options.visualStyle || 'illustration';
    const student = options.studentContext;

    let studentCtx = '';
    if (student) {
      studentCtx = `Bu etkinlik ${student.age} yaşındaki, ${student.grade}. sınıf öğrencisi ${student.name} isimli çocuk için hazırlanmaktadır. 
            Çocuğun öğrenme stili: ${student.learningStyle}. İçerik onun ilgisini çekecek düzeyde olmalı.`;
    }

    const prompt = `Sen "Disleksi ve Özel Öğrenme Güçlüğü" ve "Nöro-Pedagoji" alanında dünya çapında uzman, üst düzey bir eğitim materyali tasarımcısısın.
Görev: Öğrencinin görsel algı, detay farkındalığı ve mantıksal çıkarım yeteneklerini geliştiren "Resim Yorumlama (Doğru/Yanlış)" etkinliği üretmek.

ETKİNLİK PARAMETRELERİ:
- Tema/Konu: "${topic}" 
- Zorluk Seviyesi: "${difficulty}" 
- Soru Sayısı: ${itemCount}

${studentCtx}

AŞAMA 1: GÖRSEL KURGUSU (imagePrompt)
Detaylı, çocukların ilgisini çekecek parlak renkli bir illüstrasyon (örneğin: masada oyun hamuru ile oynayan çocuklar, parkta piknik, hayvanat bahçesi vb.) için İNGİLİZCE prompt yaz.
[KRİTİK]: Görseldeki detayların zenginliği, yazacağın Doğru/Yanlış cümlelerinin temelini oluşturacak. En az 10 spesifik detay içermeli.

AŞAMA 2: DOĞRU / YANLIŞ CÜMLELERİ
Görseldeki detaylara göre tam ${itemCount} adet kısa ve net cümle yaz. 
Bu cümlelerin yaklaşık yarısı görselle TAMAMEN UYUMLU (Doğru - 'D'), diğer yarısı ise görselde OLMAYAN VEYA YANLIŞ olan detayları (Yanlış - 'Y') içersin.
Cümleler disleksi dostu, karmaşık olmayan düz cümleler olmalıdır (Örn: "Çocuklar masada oturuyor.", "Sağda oturan çocuğun saçı sarı.").

JSON ÇIKTI FORMATI: (Yalnızca geçerli JSON döndür)
{
    "id": "visual_int_uuid",
    "visualStyle": "${visualStyle}",
    "difficultyLevel": "${difficulty}",
    "activityType": "VISUAL_INTERPRETATION",
    "title": "RESİM YORUMLAMA",
    "instruction": "Aşağıdaki cümleleri resme göre okuyup cevapla. Cümle Doğruysa (D) yanlışsa (Y) harfi koy.",
    "layoutArchitecture": {
        "blocks": [
            {
                "type": "image",
                "content": {
                    "prompt": "İNGİLİZCE detaylı kurgusal prompt",
                    "alt": "Görselin Türkçe kısa betimlemesi"
                }
            },
            {
                "type": "question",
                "content": {
                    "items": [
                        {
                            "text": "Sarı saçlı çocuk yemek yiyiyor.",
                            "type": "true_false",
                            "answer": "Y"
                        },
                        {
                            "text": "Çocuklar oyun hamurları ile oynuyor.",
                            "type": "true_false",
                            "answer": "D"
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
      temperature: 0.8
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
