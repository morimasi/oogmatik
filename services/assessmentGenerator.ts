
import { generateWithSchema } from './geminiClient';
import { Type } from "@google/genai";
import { AssessmentProfile, AssessmentReport, ActivityType } from '../types';

// Offline Heuristic Generator (Backup)
const generateOfflineAssessmentReport = (profile: AssessmentProfile): AssessmentReport => {
    // Fix: Cast results to any to allow dynamic indexing
    const results = (profile.testResults || {}) as Record<string, any>;
    
    const getScore = (key: string) => {
        const res = results[key];
        if (!res) return 0;
        // Fix: Ensure accuracy is treated as number
        return Math.max(0, Number(res.accuracy) || 0); 
    };

    const scores = {
        linguistic: getScore('linguistic'),
        logical: getScore('logical'),
        spatial: getScore('spatial'),
        musical: getScore('musical'),
        kinesthetic: getScore('kinesthetic'),
        naturalistic: getScore('naturalistic'),
        interpersonal: getScore('interpersonal'),
        intrapersonal: getScore('intrapersonal'),
        attention: getScore('attention')
    };

    // Analyze Error Patterns from Profile if available
    const errorAnalysis: string[] = [];
    if (profile.errorPatterns) {
        // Find most frequent errors
        const sortedErrors = Object.entries(profile.errorPatterns).sort((a,b) => (b[1] as number) - (a[1] as number));
        if (sortedErrors.length > 0) {
            errorAnalysis.push(`En sık yapılan hata türü: ${sortedErrors[0][0].replace('_', ' ')} (${sortedErrors[0][1]} kez).`);
            if (sortedErrors.length > 1) {
                errorAnalysis.push(`İkincil hata: ${sortedErrors[1][0].replace('_', ' ')}.`);
            }
        }
    }

    // Simple Heuristic Logic
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    if (scores.linguistic > 80) strengths.push("Sözel-Dilsel zekası güçlü. Kelimelerle arası çok iyi.");
    if (scores.logical > 80) strengths.push("Mantıksal-Matematiksel zekası baskın. Problem çözmede başarılı.");
    if (scores.spatial > 80) strengths.push("Görsel-Uzamsal zekası yüksek. Resimlerle düşünüyor.");
    
    if (scores.attention < 50) weaknesses.push("Dikkat ve odaklanma süresinde dalgalanmalar mevcut.");
    if (scores.linguistic < 50) weaknesses.push("Kelime dağarcığı ve ifade becerisi desteklenmeli.");

    return {
        overallSummary: "Öğrencinin performansı Çoklu Zeka Kuramı ve Bilişsel Beceriler çerçevesinde değerlendirilmiştir. Hata analizi, öğrencinin belirli örüntülerde zorlandığını göstermektedir.",
        scores,
        chartData: [
            { label: "Sözel", value: scores.linguistic, fullMark: 100 },
            { label: "Mantıksal", value: scores.logical, fullMark: 100 },
            { label: "Görsel", value: scores.spatial, fullMark: 100 },
            { label: "Müziksel", value: scores.musical, fullMark: 100 },
            { label: "Bedensel", value: scores.kinesthetic, fullMark: 100 },
            { label: "Doğacı", value: scores.naturalistic, fullMark: 100 },
            { label: "Sosyal", value: scores.interpersonal, fullMark: 100 },
            { label: "İçsel", value: scores.intrapersonal, fullMark: 100 }
        ],
        analysis: { strengths, weaknesses, errorAnalysis: errorAnalysis.length > 0 ? errorAnalysis : ["Detaylı hata analizi için daha fazla veri gereklidir."] },
        roadmap: [
             { activityId: 'READING_FLOW', reason: "Genel okuma desteği.", frequency: "Günlük" }
        ]
    };
};

export const generateAssessmentReport = async (profile: AssessmentProfile): Promise<AssessmentReport> => {
    let testResultsDesc = "İnteraktif test verisi yok.";
    if (profile.testResults && Object.keys(profile.testResults).length > 0) {
        testResultsDesc = "TEST SONUÇLARI (% Doğruluk):\n";
        for(const [key, result] of Object.entries(profile.testResults)) {
            // Fix: ensure result is properly typed/casted to access properties
            const typedResult = result as { name: string; accuracy: number };
            testResultsDesc += `- ${typedResult.name} (${key}): %${typedResult.accuracy.toFixed(1)}\n`;
        }
    }

    let errorPatternsDesc = "Belirgin hata paterni yok.";
    if (profile.errorPatterns && Object.keys(profile.errorPatterns).length > 0) {
        errorPatternsDesc = "HATA ANALİZİ (Tür: Sayı):\n";
        for (const [tag, count] of Object.entries(profile.errorPatterns)) {
            errorPatternsDesc += `- ${tag}: ${count}\n`;
        }
    }

    // Enhanced Professional Prompt with Error Analysis
    const prompt = `
    [ROL: EĞİTİM PSİKOLOĞU VE ÖLÇME DEĞERLENDİRME UZMANI]
    
    GÖREV: Aşağıdaki öğrenci profili, test sonuçlarını ve **HATA PATERNLERİNİ** analiz ederek, veli ve öğretmen için profesyonel, akademik dille yazılmış, yönlendirici bir "Tanılama ve Bireysel Gelişim Raporu" oluştur.
    
    ÖĞRENCİ PROFİLİ:
    - İsim: ${profile.studentName}
    - Yaş: ${profile.age}
    - Sınıf: ${profile.grade}
    - Eğitmen Gözlemleri: ${profile.observations.join(', ') || "Belirtilmemiş."}
    
    ${testResultsDesc}
    
    ${errorPatternsDesc}
    
    ANALİZ YÖNERGESİ:
    1. **Bütüncül Değerlendirme:** Öğrencinin genel performansını ve öğrenme stilini özetle.
    2. **Hata Analizi (ÇOK ÖNEMLİ):** Öğrencinin yaptığı hata türlerine (örn: 'reversal_error' -> harfleri ters algılama, 'sequencing_error' -> sıralama hatası) dayanarak, bilişsel süreçlerdeki (görsel algı, işitsel dikkat vb.) olası aksaklıkları açıkla. "Öğrenci 'b' ve 'd' harflerini karıştırma eğilimindedir" gibi spesifik ol.
    3. **Akıllı Rota (Smart Route):** Tespit edilen zayıf alanları ve hata türlerini düzeltmeye yönelik nokta atışı etkinlikler öner.
    
    ÇIKTI FORMATI (JSON):
    {
      "overallSummary": "Profesyonel özet metni.",
      "scores": { 
        "linguistic": 0-100, 
        "logical": 0-100, 
        "spatial": 0-100, 
        "musical": 0-100, 
        "kinesthetic": 0-100, 
        "naturalistic": 0-100, 
        "interpersonal": 0-100, 
        "intrapersonal": 0-100, 
        "attention": 0-100 
      },
      "chartData": [ 
          { "label": "Sözel", "value": 0-100, "fullMark": 100 }, 
          { "label": "Mantıksal", "value": 0-100, "fullMark": 100 },
          // ... diğer zeka türleri
      ],
      "analysis": {
        "strengths": ["Güçlü yön 1", ...],
        "weaknesses": ["Gelişim alanı 1", ...],
        "errorAnalysis": ["Öğrenci, görsel algı testinde %40 oranında 'reversal' hatası yapmıştır, bu da disleksi riskine işaret edebilir.", "Sıralı işlemlerde dikkat dağınıklığı gözlemlendi.", ...]
      },
      "roadmap": [
        { "activityId": "ACTIVITY_ENUM_CODE", "reason": "Tespit edilen 'reversal' hatasını gidermek için görsel ayırt etme çalışması.", "frequency": "Haftada 3 kez" }
      ]
    }
    
    NOT: 'activityId' alanı için ENUM değerlerini kullan (örn: MIRROR_LETTERS, ATTENTION_FOCUS, LETTER_DISCRIMINATION, vb.).
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            overallSummary: { type: Type.STRING },
            scores: {
                type: Type.OBJECT,
                properties: {
                    linguistic: { type: Type.INTEGER },
                    logical: { type: Type.INTEGER },
                    spatial: { type: Type.INTEGER },
                    musical: { type: Type.INTEGER },
                    kinesthetic: { type: Type.INTEGER },
                    naturalistic: { type: Type.INTEGER },
                    interpersonal: { type: Type.INTEGER },
                    intrapersonal: { type: Type.INTEGER },
                    attention: { type: Type.INTEGER },
                },
                required: ['linguistic', 'logical', 'spatial']
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
        return await generateWithSchema(prompt, schema) as unknown as AssessmentReport;
    } catch (error) {
        console.warn("AI Assessment Error, falling back:", error);
        return generateOfflineAssessmentReport(profile);
    }
};
