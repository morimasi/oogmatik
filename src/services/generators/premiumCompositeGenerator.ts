import { GeneratorOptions } from '../../types';
import { generateCreativeMultimodal } from '../geminiClient';
import { CompositeWorksheet, WidgetType } from '../../types/worksheet';
import { AppError } from '../../utils/AppError';
import { ActivityType } from '../../types/activity';

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
Sen, Oogmatik platformunun başöğretmeni, sınav mimarı ve "Premium Composite Worksheet" tasarımcısısın.
Görevin, disleksi, DEHB ve özel öğrenme güçlüğü yaşayan çocuklar için tek bir tema etrafında birbiriyle bağlantılı, pedagojik olarak kusursuz, ultra-premium bir çalışma kağıdı (Master JSON) üretmektir.

BAĞLAM:
- Konu: ${topic}
- Yaş Grubu: ${studentAge}
- Zorluk: ${difficulty}
- Profil: ${profile}
- İstenen Bileşenler (Sırasıyla):
${widgetListStr}

ÜRETİM KURALLARI:
1. HİKAYELEŞTİRME & BÜTÜNLÜK: Tüm bileşenler tek bir konu etrafında, bir hikaye veya mantıksal akış içinde birbirine bağlanmalıdır.
2. BİLEŞEN VERİLERİ (data): Her bileşenin "data" alanı o bileşenin türüne (activityId) özgü JSON yapısında olmalıdır.
   - Eğer aktivite bir İnfografik ise (Örn: INFOGRAPHIC_VENN_DIAGRAM, INFOGRAPHIC_FISHBONE):
     "data" içinde: { "title": "...", "syntax": "<activity-venn>...</activity-venn>", "templateType": "...", "activityContent": {...} } dönmelidir. Syntax alanı NativeInfographicRenderer için XML formatında olmalı.
   - Eğer aktivite bir Matematik Grafiği ise (Örn: INFOGRAPHIC_GEOMETRY_EXPLORER, INFOGRAPHIC_DATA_CHART):
     "data" içinde GrafikVerisi yapısı dönmelidir: { "tip": "kare" | "sutun_grafigi" | "sayi_dogrusu" vb., "baslik": "...", "veri": [{"etiket": "...", "deger": ...}], "ozellikler": {...} }. Ayrıca bu grafikle ilgili çözülecek bir soru varsa "question" alanını doldurabilirsin.
   - Eğer aktivite bir Okuma Parçası ise (Örn: INFOGRAPHIC_READING_FLOW):
     "data" içinde { "text": "Okuma parçası metni...", "questions": [...] } dönmelidir.
   - Eğer aktivite bir Soru/Quiz Bloğu ise (Örn: SINAV, MAT_SINAV):
     "data" içinde { "questions": [{ "soru_metni": "...", "secenekler": {"A":"..","B":"..","C":"..","D":".."}, "dogru_cevap": "A" }] } dönmelidir.
     
3. PEDAGOJİK NOT: En az 100 kelime olmalı ve bu çalışma kağıdının öğrenciye nasıl fayda sağlayacağını bilimsel (bilişsel yük kuramı, ZPD vb.) terimlerle anlatmalıdır (Elif Yıldız standartları).

4. JSON FORMATI: Yanıt sadece aşağıdaki şemaya uygun, hatasız bir JSON olmalıdır. Markdown veya ekstra açıklama kullanma.
`;

    const USER_PROMPT = `Bana belirtilen bağlamda ${widgets.length} bileşenli, '${topic}' konulu bir Master JSON üret.`;

    const schema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            topic: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
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
        required: ['title', 'topic', 'pedagogicalNote', 'difficultyLevel', 'targetSkills', 'ageGroup', 'widgets']
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
        if (Array.isArray(rawResponse)) {
            response = { title: topic, topic: topic, pedagogicalNote: '', difficultyLevel: difficulty, targetSkills: [], ageGroup: studentAge, widgets: rawResponse };
        } else if (rawResponse && rawResponse.premiumCompositeWorksheet) {
            response = rawResponse.premiumCompositeWorksheet;
        } else if (rawResponse && rawResponse.worksheet) {
            response = rawResponse.worksheet;
        } else if (rawResponse && rawResponse.data) {
            response = rawResponse.data;
        }
        
        // Eğer AI 'widgets' yerine 'activities' dediyse eşleştir
        if (response && response.activities && !response.widgets) {
            response.widgets = response.activities;
        }

        // Eğer AI 'widgets' yerine 'components' dediyse eşleştir
        if (response && response.components && !response.widgets) {
            response.widgets = response.components;
        }

        if (!response || !response.widgets || !Array.isArray(response.widgets)) {
            console.error('Beklenmeyen AI Yanıtı:', rawResponse);
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
        console.error('Composite Worksheet Generation Error:', error);
        throw error;
    }
}