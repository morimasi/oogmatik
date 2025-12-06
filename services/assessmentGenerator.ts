
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

    // Simple Heuristic Logic
    const strengths = [];
    const weaknesses = [];
    if (scores.linguistic > 80) strengths.push("Sözel-Dilsel zekası güçlü. Kelimelerle arası çok iyi.");
    if (scores.logical > 80) strengths.push("Mantıksal-Matematiksel zekası baskın. Problem çözmede başarılı.");
    if (scores.spatial > 80) strengths.push("Görsel-Uzamsal zekası yüksek. Resimlerle düşünüyor.");
    
    if (scores.attention < 50) weaknesses.push("Dikkat ve odaklanma süresinde dalgalanmalar mevcut.");
    if (scores.linguistic < 50) weaknesses.push("Kelime dağarcığı ve ifade becerisi desteklenmeli.");

    return {
        overallSummary: "Öğrencinin performansı Çoklu Zeka Kuramı çerçevesinde değerlendirilmiştir. Çevrimdışı modda olduğumuz için detaylı yapay zeka analizi yapılamamıştır, ancak temel göstergeler yukarıdadır.",
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
        analysis: { strengths, weaknesses, errorAnalysis: ["Detaylı analiz için online mod gereklidir."] },
        roadmap: [
             { activityId: ActivityType.READING_FLOW, reason: "Genel okuma desteği.", frequency: "Günlük" }
        ]
    };
};

export const generateAssessmentReport = async (profile: AssessmentProfile): Promise<AssessmentReport> => {
    let testResultsDesc = "İnteraktif test verisi yok.";
    if (profile.testResults && Object.keys(profile.testResults).length > 0) {
        testResultsDesc = "ÇOKLU ZEKA TEST SONUÇLARI (% Doğruluk):\n";
        for(const [key, result] of Object.entries(profile.testResults)) {
            testResultsDesc += `- ${result.name} (${key}): %${result.accuracy.toFixed(1)}\n`;
        }
    }

    // Enhanced Professional Prompt with Multiple Intelligences
    const prompt = `
    [ROL: EĞİTİM PSİKOLOĞU VE ÖLÇME DEĞERLENDİRME UZMANI]
    
    GÖREV: Aşağıdaki öğrenci profilini ve **Howard Gardner'ın Çoklu Zeka Kuramı** test sonuçlarını analiz ederek, veli ve öğretmen için profesyonel, akademik dille yazılmış, yönlendirici bir "Tanılama ve Bireysel Gelişim Raporu" oluştur.
    
    ÖĞRENCİ PROFİLİ:
    - İsim: ${profile.studentName}
    - Yaş: ${profile.age}
    - Sınıf: ${profile.grade}
    - Eğitmen Gözlemleri: ${profile.observations.join(', ') || "Belirtilmemiş."}
    
    ${testResultsDesc}
    
    ANALİZ YÖNERGESİ:
    1. **Bütüncül Değerlendirme:** Öğrencinin baskın zeka alanlarını (Örn: Sözel, Görsel, Doğacı vb.) belirle ve öğrenme stilini tanımla (Örn: "Bu öğrenci görsellerle ve doğa içinde daha iyi öğreniyor").
    2. **Güçlü Yönler & Gelişim Alanları:** Hangi zeka türleri yüksek, hangileri düşük?
    3. **Akıllı Rota (Smart Route):** Zayıf alanları geliştirmek için GÜÇLÜ alanlarını kaldıraç olarak kullanan stratejiler öner. 
       - Örn: Eğer "Müziksel Zeka" yüksek ama "Matematik" düşükse -> "Ritmik sayma ve şarkılarla çarpım tablosu öğretimi" öner.
       - Örn: Eğer "Görsel Zeka" yüksek ama "Okuma" düşükse -> "Resimli kartlarla kelime çalışması" öner.
    
    ÇIKTI FORMATI (JSON):
    {
      "overallSummary": "Profesyonel özet metni (3-4 cümle). Öğrenme stili vurgusu.",
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
          // ... diğer 6 zeka türü için de label/value ekle
      ],
      "analysis": {
        "strengths": ["Güçlü yön 1 (Zeka türü bağlamında)", ...],
        "weaknesses": ["Gelişim alanı 1", ...],
        "errorAnalysis": ["Bilişsel süreç analizi (Neden zorlanıyor olabilir?)", ...]
      },
      "roadmap": [
        { "activityId": "ACTIVITY_ENUM_CODE", "reason": "Neden bu etkinlik? (Güçlü yönü zayıf yöne transfer etme stratejisi)", "frequency": "Haftada 3 kez" }
      ]
    }
    
    NOT: 'activityId' alanı için şu ENUM değerlerini kullan (en uygununu seç):
    READING_FLOW, LETTER_DISCRIMINATION, RAPID_NAMING, ATTENTION_FOCUS, BASIC_OPERATIONS, NUMBER_SENSE, SPATIAL_REASONING, VISUAL_MEMORY, WORD_MEMORY, STORY_COMPREHENSION.
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
        // Using gemini-2.5-flash for speed and cost efficiency
        return await generateWithSchema(prompt, schema, 'gemini-2.5-flash') as unknown as AssessmentReport;
    } catch (error) {
        console.warn("AI Assessment Error, falling back:", error);
        return generateOfflineAssessmentReport(profile);
    }
};
