


import { generateWithSchema } from './geminiClient';
import { Type } from "@google/genai";
import { AssessmentProfile, AssessmentReport, ActivityType } from '../types';

// Offline Heuristic Generator (Backup)
const generateOfflineAssessmentReport = (profile: AssessmentProfile): AssessmentReport => {
    const results = profile.testResults || {};
    
    const getScore = (key: string) => {
        const res = results[key];
        if (!res) return 0;
        return Math.max(0, res.accuracy); 
    };

    const scores = {
        reading: getScore('linguistic'),
        math: getScore('logical'),
        attention: getScore('attention'),
        cognitive: getScore('spatial'),
        writing: 0
    };

    // Simple Heuristic Logic
    const strengths = [];
    const weaknesses = [];
    if (scores.reading > 80) strengths.push("Sözel ve dilsel becerileri yaşıtlarına göre ileri düzeyde.");
    if (scores.math > 80) strengths.push("Mantıksal çıkarım ve sayısal işlem yeteneği güçlü.");
    if (scores.reading < 50) weaknesses.push("Okuduğunu anlama ve kelime dağarcığında desteklenmeli.");
    if (scores.attention < 50) weaknesses.push("Görsel dikkat ve odaklanma süresinde dalgalanmalar mevcut.");

    return {
        overallSummary: "Öğrencinin performansı genel olarak değerlendirilmiştir. Bu rapor çevrimdışı modda oluşturulduğu için detaylı çoklu zeka analizi içermemektedir. Daha kapsamlı analiz için internet bağlantısını kontrol ediniz.",
        scores,
        chartData: [
            { label: "Sözel", value: scores.reading, fullMark: 100 },
            { label: "Mantıksal", value: scores.math, fullMark: 100 },
            { label: "Görsel", value: scores.cognitive, fullMark: 100 },
            { label: "Dikkat", value: scores.attention, fullMark: 100 },
        ],
        analysis: { strengths, weaknesses, errorAnalysis: ["Detaylı analiz için online mod gereklidir."] },
        roadmap: [
             { activityId: ActivityType.READING_FLOW, reason: "Temel okuma becerisi.", frequency: "Günlük" }
        ]
    };
};

export const generateAssessmentReport = async (profile: AssessmentProfile): Promise<AssessmentReport> => {
    let testResultsDesc = "İnteraktif test verisi yok.";
    if (profile.testResults && Object.keys(profile.testResults).length > 0) {
        testResultsDesc = "ÇOKLU ZEKA TEST SONUÇLARI:\n";
        for(const [key, result] of Object.entries(profile.testResults)) {
            testResultsDesc += `- ${result.name} (${key}): Skor ${result.score}/${result.total}, Doğruluk %${result.accuracy.toFixed(1)}.\n`;
        }
    }

    // Enhanced Professional Prompt
    const prompt = `
    [ROL: EĞİTİM PSİKOLOĞU VE ÖLÇME DEĞERLENDİRME UZMANI]
    
    GÖREV: Aşağıdaki öğrenci profilini ve **Çoklu Zeka Testi** sonuçlarını analiz ederek, veli ve öğretmen için profesyonel, akademik dille yazılmış, yönlendirici bir "Tanılama ve Bireysel Gelişim Raporu" oluştur.
    
    ÖĞRENCİ PROFİLİ:
    - İsim: ${profile.studentName}
    - Yaş: ${profile.age}
    - Sınıf: ${profile.grade}
    - Eğitmen Gözlemleri: ${profile.observations.join(', ') || "Belirtilmemiş."}
    
    ${testResultsDesc}
    
    ANALİZ YÖNERGESİ:
    1. **Bütüncül Değerlendirme:** Sadece skorları listeleme. Öğrencinin baskın zeka alanlarını (Gardner'ın kuramına göre) belirle ve öğrenme stilini tanımla (Örn: "Görsel ve Kinestetik öğrenici").
    2. **Hata Analizi (Root Cause Analysis):** Düşük skorların altındaki bilişsel nedenleri tahmin et. (Örn: Mantıksal skoru düşükse; "Sıralı işlemleme veya çalışma belleği sınırlılığı olabilir" gibi profesyonel yorumlar yap).
    3. **Kişiselleştirilmiş Rota:** Zayıf alanları geliştirmek için GÜÇLÜ alanlarını nasıl kullanabileceğini öner. (Örn: Müziksel zekası yüksek ama okuması zayıfsa; "Ritmik okuma çalışmaları yapılmalı" de).
    
    ÇIKTI FORMATI (JSON):
    {
      "overallSummary": "Profesyonel özet metni. Öğrenme stili ve genel potansiyel hakkında 3-4 cümle.",
      "scores": { "reading": 0-100, "writing": 0-100, "math": 0-100, "attention": 0-100, "cognitive": 0-100 },
      "chartData": [ 
          { "label": "Sözel-Dilsel", "value": 0-100, "fullMark": 100 }, 
          { "label": "Mantıksal-Mat.", "value": 0-100, "fullMark": 100 },
          { "label": "Görsel-Uzamsal", "value": 0-100, "fullMark": 100 },
          { "label": "Doğacı", "value": 0-100, "fullMark": 100 },
          { "label": "Müziksel", "value": 0-100, "fullMark": 100 }
      ],
      "analysis": {
        "strengths": ["Güçlü yön 1 (Zeka türü bağlamında)", ...],
        "weaknesses": ["Gelişim alanı 1", ...],
        "errorAnalysis": ["Hata analizi 1 (Bilişsel süreç analizi)", ...]
      },
      "roadmap": [
        { "activityId": "ACTIVITY_ENUM_CODE", "reason": "Neden bu etkinlik? (Zeka türüne atıfla)", "frequency": "Sıklık" }
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
        // Using gemini-2.5-flash for generic availability
        return await generateWithSchema(prompt, schema, 'gemini-2.5-flash') as unknown as AssessmentReport;
    } catch (error) {
        console.warn("AI Assessment Error, falling back:", error);
        return generateOfflineAssessmentReport(profile);
    }
};
