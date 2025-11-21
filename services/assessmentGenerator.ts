
import { generateWithSchema } from './geminiClient';
import { Type } from "@google/genai";
import { AssessmentProfile, AssessmentReport, ActivityType } from '../types';

export const generateAssessmentReport = async (profile: AssessmentProfile): Promise<AssessmentReport> => {
    // Construct dynamic description of test results
    let testResultsDesc = "İnteraktif test uygulanmadı.";
    if (profile.testResults) {
        testResultsDesc = `
        İNTERAKTİF TEST SONUÇLARI ("${profile.testResults.testName}"):
        - Skor: ${profile.testResults.score} / ${profile.testResults.totalItems}
        - Doğruluk Oranı: %${profile.testResults.accuracy.toFixed(1)}
        - Tamamlama Süresi: ${profile.testResults.durationSeconds} saniye
        - Hatalı Tıklama (Dürtüsellik/Dikkatsizlik): ${profile.testResults.errorCount}
        `;
    }

    const prompt = `
    Sen 20 yıllık deneyime sahip bir Özel Eğitim Uzmanısın. Aşağıdaki öğrenci profilini analiz ederek öğrenme güçlüğü (disleksi, disgrafi, diskalkuli) risklerini değerlendir ve bir eğitim planı oluştur.

    ÖĞRENCİ PROFİLİ:
    Yaş: ${profile.age}
    Sınıf: ${profile.grade}
    
    GÖZLEMLER:
    ${profile.observations.length > 0 ? profile.observations.join(', ') : "Ebeveyn tarafından özel bir gözlem belirtilmedi."}

    ${testResultsDesc}

    ANALİZ KURALLARI:
    1. Eğer "İnteraktif Test" sonuçlarında doğruluk düşükse veya hata sayısı yüksekse, "Dikkat" ve "Görsel Algı" skorlarını buna göre düşür ve raporda bundan bahset (Örn: "Harf avı testindeki düşük performans, görsel ayırt etme güçlüğüne işaret ediyor").
    2. Süre çok kısaysa ve hata çoksa "Dürtüsellik" vurgusu yap. Süre çok uzunsa "İşlemleme Hızı Yavaşlığı" olabilir.
    3. Gözlemler ile test sonucunu birleştir.

    GÖREVLER:
    1. Öğrencinin durumunu özetle (overallSummary). Profesyonel, pedagojik, pozitif ve yapıcı bir dil kullan.
    2. 4 ana alanda (okuma, yazma, matematik, dikkat) 0-100 arası "ihtiyaç skoru" belirle. (100 = Çok acil destek gerekli, 0 = Sorun yok).
    3. Güçlü ve zayıf yönleri maddeler halinde listele.
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