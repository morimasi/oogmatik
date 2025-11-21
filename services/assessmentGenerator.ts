
import { generateWithSchema } from './geminiClient';
import { Type } from "@google/genai";
import { AssessmentProfile, AssessmentReport, ActivityType } from '../types';

export const generateAssessmentReport = async (profile: AssessmentProfile): Promise<AssessmentReport> => {
    const prompt = `
    Sen 20 yıllık deneyime sahip bir Özel Eğitim Uzmanısın. Aşağıdaki öğrenci profilini analiz ederek öğrenme güçlüğü (disleksi, disgrafi, diskalkuli) risklerini değerlendir ve bir eğitim planı oluştur.

    ÖĞRENCİ PROFİLİ:
    Yaş: ${profile.age}
    Sınıf: ${profile.grade}
    Gözlemler: ${profile.observations.join(', ')}

    GÖREVLER:
    1. Öğrencinin durumunu özetle (overallSummary). Pozitif ve yapıcı bir dil kullan.
    2. 4 ana alanda (okuma, yazma, matematik, dikkat) 0-100 arası tahmini bir "ihtiyaç skoru" belirle. (100 = Çok acil destek gerekli, 0 = Sorun yok). Bu skorları gözlemlere dayanarak mantıklı bir şekilde çıkar.
    3. Güçlü ve zayıf yönleri listele.
    4. Bu öğrenci için en uygun 3-5 adet etkinliği (roadmap) öner. Etkinlik ID'leri şunlardan biri OLMALIDIR: ${Object.values(ActivityType).join(', ')}.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            overallSummary: { type: Type.STRING },
            scores: {
                type: Type.OBJECT,
                properties: {
                    reading: { type: Type.INTEGER },
                    writing: { type: Type.INTEGER },
                    math: { type: Type.INTEGER },
                    attention: { type: Type.INTEGER },
                },
                required: ['reading', 'writing', 'math', 'attention']
            },
            analysis: {
                type: Type.OBJECT,
                properties: {
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['strengths', 'weaknesses']
            },
            roadmap: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        activityId: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        frequency: { type: Type.STRING }
                    },
                    required: ['activityId', 'reason', 'frequency']
                }
            }
        },
        required: ['overallSummary', 'scores', 'analysis', 'roadmap']
    };

    // Safe cast since the prompt enforces the structure match
    return await generateWithSchema(prompt, schema) as unknown as AssessmentReport;
};
