
import { generateWithSchema } from './geminiClient';
import { Type } from "@google/genai";
import { AssessmentProfile, AssessmentReport, ActivityType } from '../types';

// Offline Heuristic Generator
const generateOfflineAssessmentReport = (profile: AssessmentProfile): AssessmentReport => {
    const results = profile.testResults || {};
    
    const getScore = (key: string) => {
        const res = results[key];
        if (!res) return 0;
        // Risk score = 100 - accuracy. 
        // If accuracy is 100 (perfect), risk is 0. 
        // If accuracy is 0, risk is 100.
        return Math.max(0, 100 - res.accuracy);
    };

    const scores = {
        reading: getScore('reading'),
        writing: 0, // No writing test yet, placeholder
        math: getScore('math'),
        attention: getScore('attention'),
        cognitive: getScore('cognitive')
    };

    // Analysis
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    if (scores.reading < 30) strengths.push("Okuma becerileri yaşına uygun.");
    else weaknesses.push("Okuma ve kelime tanıma çalışmaları yapılmalı.");

    if (scores.math < 30) strengths.push("Matematiksel işlem yeteneği iyi.");
    else weaknesses.push("Temel matematik kavramları desteklenmeli.");

    if (scores.attention < 30) strengths.push("Dikkat sürdürme performansı yüksek.");
    else weaknesses.push("Dikkat ve odaklanma egzersizleri önerilir.");

    if (scores.cognitive < 30) strengths.push("İşleyen bellek kapasitesi yeterli.");
    else weaknesses.push("Sıralı bellek ve işleyen bellek güçlendirilmeli.");

    // Roadmap Recommendation
    const roadmap = [];
    if (scores.reading > 30) roadmap.push({ activityId: ActivityType.READING_FLOW, reason: "Okuma akıcılığını artırmak için.", frequency: "Hergün 15 dk" });
    if (scores.attention > 30) roadmap.push({ activityId: ActivityType.BURDON_TEST, reason: "Dikkat süresini uzatmak için.", frequency: "Haftada 3 kez" });
    if (scores.cognitive > 30) roadmap.push({ activityId: ActivityType.WORD_MEMORY, reason: "Bellek kapasitesini geliştirmek için.", frequency: "Günde 10 dk" });
    if (scores.math > 30) roadmap.push({ activityId: ActivityType.MATH_PUZZLE, reason: "Sayısal düşünmeyi pekiştirmek için.", frequency: "Haftada 2 kez" });
    
    // Fill up roadmap if empty
    if (roadmap.length < 3) {
        roadmap.push({ activityId: ActivityType.STORY_COMPREHENSION, reason: "Okuduğunu anlama becerisi için.", frequency: "Haftada 2 kez" });
        if(roadmap.length < 3) roadmap.push({ activityId: ActivityType.VISUAL_ODD_ONE_OUT, reason: "Görsel algı egzersizi.", frequency: "Haftada 1 kez" });
    }

    return {
        overallSummary: "Bu rapor, çevrimdışı analiz algoritmaları kullanılarak oluşturulmuştur. Öğrencinin test performanslarına göre, " + (weaknesses.length > 0 ? "özellikle " + weaknesses.join(" ") : "genel gelişimi olumlu görünmektedir.") + " Yapay zeka analizi için internet bağlantınızı kontrol edip daha sonra tekrar deneyebilirsiniz.",
        scores,
        chartData: [
            { label: "Okuma", value: scores.reading, fullMark: 100 },
            { label: "Matematik", value: scores.math, fullMark: 100 },
            { label: "Dikkat", value: scores.attention, fullMark: 100 },
            { label: "Görsel", value: getScore('visual'), fullMark: 100 },
            { label: "Bellek", value: scores.cognitive, fullMark: 100 },
        ],
        analysis: { strengths, weaknesses },
        roadmap: roadmap.slice(0, 3)
    };
};

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
    Sen 20 yıllık deneyime sahip bir Özel Eğitim Uzmanısın. Öğrenme güçlüğü (disleksi, disgrafi, diskalkuli) ve DEHB risklerini değerlendir.

    ÖĞRENCİ PROFİLİ:
    Yaş: ${profile.age}
    Sınıf: ${profile.grade}
    
    GÖZLEMLER ve DETAYLAR:
    ${profile.observations.length > 0 ? profile.observations.join(', ') : "Belirtilmedi."}

    ${testResultsDesc}

    ANALİZ KURALLARI:
    1. OKUMA TESTİ ANALİZİ (Çok Önemli):
       - Gözlemlerdeki "Kelime Tanıma" (Lexical) ve "Cümle Anlama" (Comprehension) skorlarını karşılaştır.
       - HİPERLEKSİ RİSKİ: Eğer Kelime Tanıma yüksek ama Cümle Anlama düşükse -> "Hiperleksi" riski veya "Anlama güçlüğü" olarak işaretle.
       - DİSLEKSİ RİSKİ: Eğer her ikisi de düşükse -> "Disleksi" (Fonolojik/Yüzeyel) riski.
       - TELAFİ EDİLMİŞ DİSLEKSİ: Eğer Kelime Tanıma düşük ama Cümle Anlama iyiyse -> Bağlamı kullanarak okuma stratejisi geliştirmiş olabilir.
    2. MATEMATİK TESTİ: Düşük skor/yavaş hız -> Diskalkuli riski.
    3. DİKKAT TESTİ (Harf Avı - Grid): Düşük skor, yüksek hata -> Dikkat eksikliği.
    4. GÖRSEL TEST (Matris Mantığı): Düşük skor -> Görsel algı / Soyut düşünme zayıflığı.
    5. BİLİŞSEL TEST (Sıralı Bellek): Düşük skor -> İşleyen Bellek (Working Memory) zayıflığı.
       * İşleyen bellek düşüklüğü hem DEHB hem de Disleksi için kritik bir belirleyicidir.
    
    GÖREVLER:
    1. "overallSummary": Pedagojik ve yapıcı bir özet yaz. Özellikle okuma analizindeki (varsa) kelime vs anlama farkına değin.
    2. "scores": 5 alanda (reading, writing, math, attention, cognitive) 0-100 arası "İHTİYAÇ/RİSK" skoru ver (Yüksek skor = Yüksek Risk).
    3. "chartData": Radar grafiği için veri. Label (Alan adı) ve Value (0-100 Puan). 
       (Labels: "Okuma", "Matematik", "Dikkat", "Görsel", "Bellek").
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
                    cognitive: { type: Type.INTEGER }, // Working Memory Score
                },
                required: ['reading', 'writing', 'math', 'attention', 'cognitive']
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

    try {
        // Use 'gemini-3-pro-preview' for maximum reasoning capability in assessment reports.
        return await generateWithSchema(prompt, schema, 'gemini-3-pro-preview') as unknown as AssessmentReport;
    } catch (error) {
        console.warn("AI Assessment generation failed (likely 429 or 500). Falling back to heuristic mode.", error);
        return generateOfflineAssessmentReport(profile);
    }
};
