
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
        writing: 0, 
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

    // Roadmap Recommendation
    const roadmap = [];
    if (scores.reading > 30) roadmap.push({ activityId: ActivityType.READING_FLOW, reason: "Okuma akıcılığını artırmak için.", frequency: "Hergün 15 dk" });
    if (scores.attention > 30) roadmap.push({ activityId: ActivityType.BURDON_TEST, reason: "Dikkat süresini uzatmak için.", frequency: "Haftada 3 kez" });
    if (roadmap.length < 3) {
        roadmap.push({ activityId: ActivityType.STORY_COMPREHENSION, reason: "Okuduğunu anlama becerisi için.", frequency: "Haftada 2 kez" });
    }

    return {
        overallSummary: "Bu rapor, çevrimdışı analiz algoritmaları kullanılarak oluşturulmuştur. İnternet bağlantınızı kontrol edip yapay zeka destekli detaylı analiz alabilirsiniz.",
        scores,
        chartData: [
            { label: "Okuma", value: scores.reading, fullMark: 100 },
            { label: "Matematik", value: scores.math, fullMark: 100 },
            { label: "Dikkat", value: scores.attention, fullMark: 100 },
            { label: "Bellek", value: scores.cognitive, fullMark: 100 },
        ],
        analysis: { strengths, weaknesses },
        roadmap: roadmap
    };
};

export const generateAssessmentReport = async (profile: AssessmentProfile): Promise<AssessmentReport> => {
    let testResultsDesc = "İnteraktif test verisi yok.";
    if (profile.testResults && Object.keys(profile.testResults).length > 0) {
        testResultsDesc = "İNTERAKTİF BATARYA SONUÇLARI:\n";
        for(const [key, result] of Object.entries(profile.testResults)) {
            testResultsDesc += `- ${result.name}: Skor ${result.score}/${result.total}, Doğruluk %${result.accuracy.toFixed(1)}, Süre ${result.duration}sn. (Hata Analizi Yapılmalı)\n`;
        }
    }

    const prompt = `
    [ROL: KIDEMLİ ÖZEL EĞİTİM UZMANI ve PEDAGOG]
    
    Aşağıdaki öğrenci profilini ve test performans verilerini derinlemesine analiz ederek profesyonel bir tanı ve destek raporu oluştur.
    
    ÖĞRENCİ: ${profile.studentName}, ${profile.age} Yaş, ${profile.grade}, ${profile.gender}.
    EĞİTMEN GÖZLEMLERİ: ${profile.observations.join(', ') || "Belirtilmemiş"}.
    
    ${testResultsDesc}
    
    GÖREVLER:
    1. **HATA ANALİZİ (Error Analysis):** Sadece skorlara bakma. Öğrencinin neden hata yapmış olabileceğini (dikkat dağınıklığı, kavram yanılgısı, işlem hatası vb.) pedagojik açıdan yorumla.
    2. **PEDAGOJİK YORUM:** Öğrenme stilini ve bilişsel güçlü/zayıf yönlerini (işleyen bellek, görsel algı vb.) belirle.
    3. **RİSK SKORLAMASI:** Aşağıdaki alanlarda 0-100 arası "Destek İhtiyacı" puanı ver (Yüksek puan = Yüksek Risk).
    
    ÇIKTI FORMATI (JSON):
    - overallSummary: Profesyonel, veliye hitap eden, cesaretlendirici ama gerçekçi, tıbbi tanı koymadan (örn: "Disleksi riski görüldü" yerine "Okuma akıcılığında destek ihtiyacı gözlendi") yazılmış 3-4 cümlelik özet.
    - scores: { reading, math, attention, cognitive (bellek), writing }
    - chartData: Radar grafiği için [{label, value, fullMark: 100}] dizisi.
    - analysis: { strengths: ["Güçlü yön 1", "Güçlü yön 2"], weaknesses: ["Gelişim alanı 1", "Gelişim alanı 2"] }
    - roadmap: Öğrenciye özel 3 adet etkinlik önerisi. ActivityType ID'si, nedeni ve uygulama sıklığı.
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
                    cognitive: { type: Type.INTEGER },
                },
                required: ['reading', 'math', 'attention']
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
        return await generateWithSchema(prompt, schema, 'gemini-3-pro-preview') as unknown as AssessmentReport;
    } catch (error) {
        console.warn("AI Assessment Error, falling back:", error);
        return generateOfflineAssessmentReport(profile);
    }
};
