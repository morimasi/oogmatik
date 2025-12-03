
import { generateWithSchema } from './geminiClient';
import { Type } from "@google/genai";
import { AssessmentProfile, AssessmentReport, ActivityType } from '../types';

// Offline Heuristic Generator (Enhanced with basic error assumption)
const generateOfflineAssessmentReport = (profile: AssessmentProfile): AssessmentReport => {
    const results = profile.testResults || {};
    
    const getScore = (key: string) => {
        const res = results[key];
        if (!res) return 0;
        return Math.max(0, 100 - res.accuracy); // Risk Score (Inverse of accuracy)
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
    const errorAnalysis: string[] = [];
    
    if (scores.reading < 30) {
        strengths.push("Okuma becerileri sınıf düzeyine uygun.");
    } else {
        weaknesses.push("Kelime tanıma ve akıcı okumada destek ihtiyacı.");
        errorAnalysis.push("Okuma hataları genellikle harf karıştırma veya hece atlama kaynaklı olabilir.");
    }

    if (scores.math < 30) {
        strengths.push("Sayısal işlem ve mantık yürütme becerisi güçlü.");
    } else {
        weaknesses.push("Temel matematiksel kavramlarda eksiklikler.");
        errorAnalysis.push("İşlem hataları, dikkatsizlikten ziyade kavramsal yanılgılardan kaynaklanıyor olabilir.");
    }

    // Roadmap Recommendation
    const roadmap = [];
    if (scores.reading > 30) roadmap.push({ activityId: ActivityType.READING_FLOW, reason: "Okuma akıcılığını ve harf farkındalığını artırmak için.", frequency: "Hergün 15 dk" });
    if (scores.attention > 30) roadmap.push({ activityId: ActivityType.BURDON_TEST, reason: "Sürdürülebilir dikkat süresini uzatmak için.", frequency: "Haftada 3 kez" });
    if (scores.math > 30) roadmap.push({ activityId: ActivityType.NUMBER_SENSE, reason: "Sayı hissi ve temel kavramları pekiştirmek için.", frequency: "Haftada 3 kez" });
    
    if (roadmap.length < 3) {
        roadmap.push({ activityId: ActivityType.STORY_COMPREHENSION, reason: "Okuduğunu anlama ve çıkarım yapma becerisi için.", frequency: "Haftada 2 kez" });
    }

    return {
        overallSummary: "Bu rapor, çevrimdışı algoritmalarla oluşturulmuştur. Öğrencinin temel alanlardaki performansı sınıf düzeyine göre değerlendirilmiştir. Detaylı pedagojik analiz için lütfen çevrimiçi modu kullanın.",
        scores,
        chartData: [
            { label: "Okuma", value: scores.reading, fullMark: 100 },
            { label: "Matematik", value: scores.math, fullMark: 100 },
            { label: "Dikkat", value: scores.attention, fullMark: 100 },
            { label: "Bilişsel", value: scores.cognitive, fullMark: 100 },
        ],
        analysis: { strengths, weaknesses, errorAnalysis },
        roadmap: roadmap
    };
};

export const generateAssessmentReport = async (profile: AssessmentProfile): Promise<AssessmentReport> => {
    let testResultsDesc = "İnteraktif test verisi yok.";
    if (profile.testResults && Object.keys(profile.testResults).length > 0) {
        testResultsDesc = "TEST BATARYASI SONUÇLARI:\n";
        for(const [key, result] of Object.entries(profile.testResults)) {
            testResultsDesc += `- ${result.name} (${key}): Skor ${result.score}/${result.total}, Doğruluk %${result.accuracy.toFixed(1)}. (Süre: ${result.duration}sn)\n`;
        }
    }

    // New Prompt for Senior Specialist Role
    const prompt = `
    [ROL: KIDEMLİ ÖZEL EĞİTİM UZMANI ve PEDAGOG]
    
    GÖREV: Aşağıdaki öğrenci profilini ve test performans verilerini analiz ederek, profesyonel bir "Tanılama ve Destek Raporu" oluştur. Rapor, resmi bir dille yazılmalı ve veli/öğretmen için rehber niteliği taşımalıdır.
    
    ÖĞRENCİ PROFİLİ:
    - İsim: ${profile.studentName}
    - Yaş: ${profile.age}
    - Sınıf: ${profile.grade}
    - Cinsiyet: ${profile.gender}
    - Eğitmen Gözlemleri: ${profile.observations.join(', ') || "Ek gözlem belirtilmemiş."}
    
    ${testResultsDesc}
    
    ANALİZ BEKLENTİLERİ:
    1. **HATA ANALİZİ (Kritik):** Sadece skorlara bakma. Öğrencinin yaşına ve sınıf düzeyine göre yapması beklenen beceriler ile test sonuçlarını karşılaştır. Düşük skorların altında yatan olası bilişsel nedenleri (örn: İşleyen bellek zayıflığı, fonolojik farkındalık eksikliği, görsel-uzamsal algı güçlüğü) belirle. Hata analizini 'analysis.errorAnalysis' alanına liste olarak ekle.
    2. **PEDAGOJİK YORUM:** Öğrenme stilini belirle. Güçlü yönlerini, zayıf yönlerini telafi etmek için nasıl kullanabileceğini açıkla.
    3. **RİSK SKORLAMASI:** Aşağıdaki alanlarda 0-100 arası "Destek İhtiyacı/Risk" puanı ver (0=Risk Yok, 100=Acil Destek Gerekli).
    
    ÇIKTI FORMATI (JSON):
    {
      "overallSummary": "Profesyonel özet metni. (3-4 cümle)",
      "scores": { "reading": 0-100, "writing": 0-100, "math": 0-100, "attention": 0-100, "cognitive": 0-100 },
      "chartData": [ { "label": "Okuma", "value": 0-100, "fullMark": 100 }, ... ],
      "analysis": {
        "strengths": ["Güçlü yön 1", ...],
        "weaknesses": ["Gelişim alanı 1", ...],
        "errorAnalysis": ["Hata analizi 1 (Örn: Okuma hataları heceleme aşamasındaki takılmalardan kaynaklanıyor...)", ...]
      },
      "roadmap": [
        { "activityId": "ACTIVITY_ENUM_CODE", "reason": "Neden bu etkinlik?", "frequency": "Uygulama sıklığı" }
      ]
    }
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
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                    errorAnalysis: { type: Type.ARRAY, items: { type: Type.STRING } }
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
        // Using gemini-2.5-flash for free tier compatibility instead of gemini-3-pro-preview
        return await generateWithSchema(prompt, schema, 'gemini-2.5-flash') as unknown as AssessmentReport;
    } catch (error) {
        console.warn("AI Assessment Error, falling back:", error);
        return generateOfflineAssessmentReport(profile);
    }
};
