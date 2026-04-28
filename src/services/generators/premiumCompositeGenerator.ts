import { GeneratorOptions } from '../../types';
import { generateCreativeMultimodal } from '../geminiClient';
import { CompositeWorksheet, WidgetType } from '../../types/worksheet';
import { AppError } from '../../utils/AppError';
import { ActivityType } from '../../types/activity';

import { logInfo, logError, logWarn } from '../../utils/logger.js';
export interface CompositeGeneratorOptions extends GeneratorOptions {
    widgets: { id: string; activityId: string }[];
}

export async function generateCompositeWorksheet(
    options: CompositeGeneratorOptions
): Promise<CompositeWorksheet> {
    const { topic, studentAge, difficulty, profile, widgets } = options;

    if (!topic || widgets.length === 0) {
        throw new AppError('Konu veya seçili bileşen eksik.', 'VALIDATION_ERROR', 400);
    }

    const widgetListStr = widgets.map((w, i) => `${i + 1}. Bileşen: ${w.activityId}`).join('\n');

    const SYSTEM_PROMPT = `
Sen, Oogmatik platformunun başöğretmeni, sınav mimarı ve "Premium Composite Worksheet" tasarımcısısın. [Build: PremiumV5]
Görevin, disleksi, DEHB ve özel öğrenme güçlüğü yaşayan çocuklar için tek bir tema etrafında birbiriyle bağlantılı, pedagojik olarak kusursuz, ultra-premium bir çalışma kağıdı (Master JSON) üretmektir.

BAĞLAM:
- Konu/Açıklama: ${topic}
- Yaş Grubu: ${studentAge}
- Zorluk: ${difficulty}
- Öğrenme Profili: ${profile}
- Senden istenen Bileşenler (Widgets) sırasıyla şunlardır:
${widgetListStr}

[KRİTİK KURALLAR - ASLA İHLAL ETME]
1. HİKAYELEŞTİRME & BÜTÜNLÜK: Tüm bileşenler tek bir konu etrafında, bir hikaye veya mantıksal akış içinde birbirine bağlanmalıdır.
2. ÖĞRENCİYLE KONUŞMA: "Sevgili öğrenci, şimdi bunu yapalım" gibi konuşma metinleri yazma. Sen bir yazar değil, bir "Sınav Kağıdı Formatlayıcısısın". Sadece kesin, net sorular, profesyonel infografik XML'leri ve matematik grafik JSON'ları üretmelisin.
3. BİLEŞEN VERİLERİ (data): Her bileşenin "data" alanı, o bileşenin türüne özgü bir formatta olmalıdır.
   
   A) İNFOGRAFİK BİLEŞENİ (type: "infographic"):
      "data.syntax" alanı KESİNLİKLE bir XML formatında olmalıdır. ASLA düz metin veya paragraf yazma!
      ⚠️ ÇOK ÖNEMLİ: XML ETİKETLERİNİN İÇİNDE ASLA ÇİFT TIRNAK (") KULLANMA! Özellikler (attributes) için daima TEK TIRNAK (') kullan. (Örn: <item key='who' /> DOĞRU, <item key="who" /> YANLIŞTIR). Çift tırnak kullanırsan JSON yapısı anında bozulur ve çöker!
      Eğer konu 5N1K ise syntax şöyle olmalı: <five-w-one-h><who>...</who><what>...</what><when>...</when><where>...</where><why>...</why><how>...</how></five-w-one-h>
      Eğer konu Venn ise: <venn-diagram><setA label='A'> <item>...</item> </setA> <setB label='B'> <item>...</item> </setB> <intersection> <item>...</item> </intersection></venn-diagram>
      
   B) MATEMATİK GRAFİĞİ BİLEŞENİ (type: "math_graphic"):
      "data" içinde "tip", "baslik", "veri" ve "ozellikler" olmalıdır. 
      Örnek "veri": [{"etiket": "Elma", "deger": 5}]
      Örnek soru: "question": {"soru_metni": "...", "secenekler": {"A":"..","B":"..","C":"..","D":".."}, "dogru_cevap": "A"}
      *GRAFİKTEKİ SAYILAR İLE SORU METNİNDEKİ SAYILAR %100 AYNI OLMALIDIR!*

   C) OKUMA PARÇASI (type: "reading_passage"):
      "data" içinde { "title": "Başlık", "text": "Disleksi dostu, kısa ve öz okuma parçası metni..." }
      
   D) TEST / QUİZ BİLEŞENİ (type: "quiz_block"):
      "data" içinde "questions" dizisi olmalı. 
      Her soru: { "soru_metni": "...", "secenekler": {"A":"..","B":"..","C":"..","D":".."}, "dogru_cevap": "A" }

4. JSON FORMATI: Yanıt, aşağıdaki şemaya uygun, kusursuz bir JSON olmalıdır. Başka hiçbir açıklama ekleme.
`;

    const USER_PROMPT = `Bana belirtilen bağlamda ${widgets.length} bileşenli, '${topic}' konulu bir Master JSON üret.`;

    const schema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            topic: { type: 'STRING' },
            difficultyLevel: { type: 'STRING', enum: ['Kolay', 'Orta', 'Zor'] },
            targetSkills: { type: 'ARRAY', items: { type: 'STRING' } },
            ageGroup: { type: 'STRING', enum: ['5-7', '8-10', '11-13', '14+'] },
            widgets: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        id: { type: 'STRING' },
                        type: { type: 'STRING', enum: ['infographic', 'math_graphic', 'reading_passage', 'quiz_block', 'text_block'] },
                        activityId: { type: 'STRING' },
                        data: { type: 'OBJECT' }
                    },
                    required: ['id', 'type', 'activityId', 'data']
                }
            }
        },
        required: ['title', 'topic', 'difficultyLevel', 'targetSkills', 'ageGroup', 'widgets']
    };

    try {
        const rawResponse = await generateCreativeMultimodal({
            prompt: USER_PROMPT,
            systemInstruction: SYSTEM_PROMPT,
            schema,
            temperature: 0.7
        });

        // Güvenlik kontrolü ve JSON Onarımı
        let response = rawResponse;

        // Eğer AI yanıtı doğrudan bir metin stringi içine (Markdown json bloğu) gömdüyse onu ayıkla
        if (rawResponse && typeof rawResponse.text === 'string') {
            try {
                let cleanedText = rawResponse.text.replace(/```json\n?/i, '').replace(/```\n?/g, '').trim();
                response = JSON.parse(cleanedText);
            } catch (e) {
                logError('Markdown JSON parse hatası:', e);
                throw new AppError('Yapay zeka yanıtı çözümleyemedi. Lütfen tekrar deneyin.', 'JSON_PARSE_ERROR', 500);
            }
        }

        if (Array.isArray(response)) {
            response = { title: topic, topic: topic, difficultyLevel: difficulty, targetSkills: [], ageGroup: studentAge, widgets: response };
        } else if (response && response.premiumCompositeWorksheet) {
            response = response.premiumCompositeWorksheet;
        } else if (response && response.worksheet) {
            response = response.worksheet;
        } else if (response && response.data) {
            response = response.data;
        }
        
        // Eğer AI 'widgets' yerine 'activities', 'components', 'items' gibi başka bir isim verdiyse, objenin içindeki ilk diziyi (array) bul
        if (response && !response.widgets) {
            const arrayKey = Object.keys(response).find(key => Array.isArray(response[key]));
            if (arrayKey) {
                response.widgets = response[arrayKey];
            }
        }

        if (!response || !response.widgets || !Array.isArray(response.widgets)) {
            logError('Beklenmeyen AI Yanıtı:', rawResponse);
            throw new AppError('Yapay zeka beklenen formati üretemedi (widgets dizisi bulunamadı). Lütfen tekrar deneyin.', 'INVALID_AI_RESPONSE', 500);
        }

        // Backend ids matched to frontend added widget ids
        response.widgets.forEach((w: any, index: number) => {
            if (widgets[index]) {
                w.id = widgets[index].id;
                w.activityId = widgets[index].activityId;
            }
            // Auto-detect widget type if AI missed it based on activityId
            if (!w.type) {
                if (w.activityId.includes('MATH') || w.activityId.includes('GEOMETRY') || w.activityId.includes('DATA')) {
                    w.type = 'math_graphic';
                } else if (w.activityId.includes('READING') || w.activityId.includes('STORY')) {
                    w.type = 'reading_passage';
                } else if (w.activityId.includes('SINAV') || w.activityId.includes('QUIZ')) {
                    w.type = 'quiz_block';
                } else {
                    w.type = 'infographic';
                }
            }
        });

        return {
            id: Date.now().toString(),
            ...response,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as CompositeWorksheet;
    } catch (error) {
        logError('Composite Worksheet Generation Error:', error);
        throw error;
    }
}