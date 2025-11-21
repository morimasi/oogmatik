
import { generateWithSchema } from './geminiClient';
import { Type } from "@google/genai";
import { AssessmentProfile, AssessmentReport, ActivityType } from '../types';

export const generateAssessmentReport = async (profile: AssessmentProfile): Promise<AssessmentReport> => {
    // Construct dynamic description of test results
    let testResultsDesc = "İnteraktif test verisi yok.";
    if (profile.testResults && Object.keys(profile.testResults).length > 0) {
        testResultsDesc = "İNTERAKTİF BATARYA SONUÇLARI:\n";
        for(const [key, result] of Object.entries(profile.testResults)) {
            testResultsDesc += `- ${result.name}: Skor ${result.score}/${result.total}, Doğruluk %${result.accuracy.toFixed(1)}, Süre ${result.duration}sn.\n`;
        }
    }

    const prompt = `
    Sen 20 yıllık deneyime sahip bir Özel Eğitim Uzmanısın. Öğrenme güçlüğü (disleksi, disgrafi, diskalkuli) risklerini değerlendir.

    ÖĞRENCİ PROFİLİ:
    Yaş: ${profile.age}
    Sınıf: ${profile.grade}
    
    GÖZLEMLER:
    ${profile.observations.length > 0 ? profile.observations.join(', ') : "Belirtilmedi."}

    ${testResultsDesc}

    ANALİZ KURALLARI:
    1. Okuma Testi (Lexical): Düşük doğruluk -> Disleksi riski.
    2. Matematik Testi: Düşük skor/yavaş hız -> Diskalkuli riski.
    3. Dikkat Testi (Harf Avı): Çok hata -> Dürtüsellik; Yavaşlık -> İşlemleme hızı.
    4. Görsel Test: Düşük skor -> Disgrafi/Görsel Algı.
    
    GÖREVLER:
    1. "overallSummary": Pedagojik ve yapıcı bir özet yaz.
    2. "scores": 4 alanda (reading, writing, math, attention) 0-100 arası "İHTİYAÇ/RİSK" skoru ver (Yüksek skor = Yüksek Risk).
    3. "chartData": Radar grafiği için veri. Label (Alan adı) ve Value (0-100 Puan). 
       (Labels: "Okuma", "Yazma", "Matematik", "Dikkat").
    4. "roadmap": 3 etkinlik öner. ActivityID şunlardan biri: ${Object.values(ActivityType).join(', ')}.
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
            chartData: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.INTEGER },
                        fullMark: { type: Type.INTEGER }
                    },
                    required: ['label', 'value', 'fullMark']
                }
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
        required: ['overallSummary', 'scores', 'chartData', 'analysis', 'roadmap']
    };

    return await generateWithSchema(prompt, schema) as unknown as AssessmentReport;
};
