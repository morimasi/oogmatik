import { GeneratorOptions, WorksheetData } from '../../types';
import { BaseGenerator } from './core/BaseGenerator';
import { generateCreativeMultimodal } from '../geminiClient';

export class VisualInterpretationGenerator extends BaseGenerator<WorksheetData> {
  constructor() {
    super();
  }

  private topicLabels: Record<string, string> = {
    daily_life: 'Günlük Yaşam (Ev, Okul, Park)',
    nature: 'Doğa ve Hayvanlar',
    city: 'Şehir ve Trafik',
    fantasy: 'Masal ve Fantastik',
    sports: 'Spor ve Hareket',
    emotions: 'Duygular ve İfadeler',
    jobs: 'Meslekler ve İş Yerleri',
    abstract: 'Soyut ve Desenler',
    'çocuklar ve oyun': 'Çocuklar ve Oyun',
  };

  protected async execute(options: GeneratorOptions): Promise<WorksheetData> {
    const topic = this.topicLabels[(options.topic as string) || 'daily_life'] || options.topic || 'Günlük Yaşam (Ev, Okul, Park)';
    const difficulty = options.difficulty || 'Orta';
    const itemCount = (options.itemCountVisual as number) || options.itemCount || 10;
    const visualStyle = options.visualStyle || options.visualInterpretationStyle || 'illustration';
    const questionStyle = (options.visualInterpretationStyle as string) || 'mixed';
    const visualComplexity = (options.visualComplexityLevel as string) || 'medium';
    const generateImage = (options.generateImage as boolean) ?? true;
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
- Görsel Karmaşıklık: "${visualComplexity}"
- Soru Tipi: "${questionStyle}" (true_false | multiple_choice | open_ended | mixed)

${studentCtx}

AŞAMA 1: GÖRSEL KURGUSU (imagePrompt)
Detaylı, çocukların ilgisini çekecek parlak renkli bir illüstrasyon (örneğin: masada oyun hamuru ile oynayan çocuklar, parkta piknik, hayvanat bahçesi vb.) için İNGİLİZCE prompt yaz.
[KRİTİK]: Görseldeki detayların zenginliği, yazacağın soruların temelini oluşturacak. En az 10 spesifik detay içermeli.

AŞAMA 2: SORULAR
"${questionStyle}" tipine uygun tam ${itemCount} adet kısa ve net soru/cümle yaz.
- true_false: cümlelerin yaklaşık yarısı görselle TAMAMEN UYUMLU (Doğru - 'D'), diğer yarısı görselde OLMAYAN VEYA YANLIŞ (Yanlış - 'Y') olsun.
- multiple_choice: her soru için 3-4 şıklı seçenekler ver.
- open_ended: görseldeki detaylara dayalı açık uçlu sorular sor.
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

    // Görsel üretimini dene (yalnızca kullanıcı isterse)
    const blocks = (generatedData as unknown as Record<string, unknown>)?.layoutArchitecture as unknown as Record<string, unknown> | undefined;
    const blockList = blocks?.blocks as unknown as Record<string, unknown>[] | undefined;
    const imageBlock = blockList?.find(b => b.type === 'image');
    if (generateImage && imageBlock && (imageBlock.content as unknown as Record<string, unknown>)?.prompt) {
      try {
        const imgResponse = await fetch('/api/ai/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: (imageBlock.content as unknown as Record<string, unknown>).prompt,
            style: options.visualStyle || options.visualInterpretationStyle || 'illustration'
          })
        });
        if (imgResponse.ok) {
          const imgData = await imgResponse.json() as { base64?: string };
          if (imgData.base64) {
            (imageBlock.content as unknown as Record<string, unknown>).base64 = imgData.base64;
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

    const layout = (generatedData as unknown as Record<string, unknown>)?.layoutArchitecture as unknown as Record<string, unknown> | undefined;
    const blockList2 = layout?.blocks as unknown as Record<string, unknown>[] | undefined;
    if (!layout || !Array.isArray(blockList2) || blockList2.length === 0) {
      throw new Error('Resim Yorumlama AI çıktısı geçersiz: layoutArchitecture.blocks eksik.');
    }

    return generatedData as unknown as WorksheetData;
  }
}

export const generateVisualInterpretationFromAI = async (options: GeneratorOptions): Promise<WorksheetData> => {
  const generator = new VisualInterpretationGenerator();
  return generator.generate(options) as unknown as Promise<WorksheetData>;
};
