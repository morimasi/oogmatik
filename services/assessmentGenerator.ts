
import { generateWithSchema } from './geminiClient.js';
import { AssessmentProfile, AssessmentReport } from '../types.js';

/**
 * FAZ 3: Klinik AI Rapor Motoru
 * Gemini'ye gerçek test verilerini göndererek nöropsikolojik rapor üretir.
 */
export const generateAssessmentReport = async (profile: AssessmentProfile): Promise<AssessmentReport> => {
    let testResultsBlock = "İnteraktif test verisi yok.";
    if (profile.testResults && Object.keys(profile.testResults).length > 0) {
        testResultsBlock = "TESTLERDEKİ DOĞRULUK YÜZDELERİ:\n";
        for (const [key, result] of Object.entries(profile.testResults)) {
            const typedResult = result as { name: string; accuracy: number };
            testResultsBlock += `  • ${typedResult.name} (${key}): %${typedResult.accuracy.toFixed(1)}\n`;
        }
    }

    let errorBlock = "";
    if (profile.errorPatterns && Object.keys(profile.errorPatterns).length > 0) {
        errorBlock = "\nHATA PATERNLERİ (Hata Yüzdesi %):\n";
        for (const [domain, errorPct] of Object.entries(profile.errorPatterns)) {
            errorBlock += `  • ${domain}: %${errorPct}\n`;
        }
    }

    const prompt = `
[ROL: Klinik Nöropsikolog + Özel Eğitim ve Ölçme-Değerlendirme Uzmanı]

GÖREV: Aşağıdaki öğrencinin bilişsel değerlendirme verilerini DSM-5 ve ICD-11 kriterleriyle bağlantılı olarak analiz et. 
Hem uzman hem de ebeveyn/öğretmen için anlaşılır, somut ve uygulanabilir bulgular üret.

ÖĞRENCİ PROFİLİ:
  Ad: ${profile.studentName}
  Yaş: ${profile.age}
  Sınıf: ${profile.grade}

${testResultsBlock}${errorBlock}

KLİNİK GÖZLEMLER:
${profile.observations.map(o => `  • ${o}`).join('\n')}

ANALİZ TALİMATLARI:
1. overallSummary: 3-4 cümlelik uzman klinik özet. Öğrencinin genel bilişsel profilini, risk alanlarını ve güçlü yönlerini belirt. Net, ölçüm tabanlı dil kullan.
2. scores: Her bilişsel alandaki tahmini performans puanı (0-100). Test verilerine dayalı hesapla.
3. chartData: Radar grafiği için etiket-değer çiftleri. En az 4 bil alan ekle.
4. analysis.strengths: %75+ performans gösteren alanlarda kanıt tabanlı güçlü yönler. Her madde somut olsun.
5. analysis.weaknesses: %65 altı alanlarda pedagojik destek önerileri. "Desteklenmeli" değil "Önerilen müdahale:" formatında yaz.
6. analysis.errorAnalysis: Hata tiplerini bilişsel kökenlerine göre analiz et (reversal, dikkat kayması, impulsivite, fonolojik güçlük vb.).
7. roadmap: Öncelikli 5 aktivite önerisi. activityId Türkçe değil İngilizce büyük harf (ör: VISUAL_MEMORY, STROOP_TEST, PHONOLOGICAL_AWARENESS). Frequency: "Haftada X kez" formatında.

UYARI: Tanı koymaktan kaçın. "Risk göstergesi", "dikkat edilmesi önerilir" gibi dikkatli ifadeler kullan.
DILE getir: Türkçe, profesyonel, net.
`;

    const schema = {
        type: 'OBJECT',
        properties: {
            overallSummary: { type: 'STRING', description: "3-4 cümlelik klinik özet" },
            scores: {
                type: 'OBJECT',
                properties: {
                    linguistic: { type: 'INTEGER' },
                    logical: { type: 'INTEGER' },
                    spatial: { type: 'INTEGER' },
                    attention: { type: 'INTEGER' },
                    phonological: { type: 'INTEGER' }
                }
            },
            chartData: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        label: { type: 'STRING' },
                        value: { type: 'INTEGER' },
                        fullMark: { type: 'INTEGER' }
                    },
                    required: ['label', 'value', 'fullMark']
                }
            },
            analysis: {
                type: 'OBJECT',
                properties: {
                    strengths: { type: 'ARRAY', items: { type: 'STRING' } },
                    weaknesses: { type: 'ARRAY', items: { type: 'STRING' } },
                    errorAnalysis: { type: 'ARRAY', items: { type: 'STRING' } }
                },
                required: ['strengths', 'weaknesses', 'errorAnalysis']
            },
            roadmap: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        activityId: { type: 'STRING' },
                        reason: { type: 'STRING', description: "Pedagojik gerekçe, öğrenciye özel" },
                        frequency: { type: 'STRING', description: "Haftada X kez formatında" }
                    },
                    required: ['activityId', 'reason', 'frequency']
                }
            }
        },
        required: ['overallSummary', 'scores', 'chartData', 'analysis', 'roadmap']
    };

    return await generateWithSchema(prompt, schema) as unknown as AssessmentReport;
};
