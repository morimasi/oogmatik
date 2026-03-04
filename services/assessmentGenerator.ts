
import { generateWithSchema } from './geminiClient';
import { Type } from "@google/genai";
import { AssessmentProfile, AssessmentReport } from '../types';

export const generateAssessmentReport = async (profile: AssessmentProfile): Promise<AssessmentReport> => {
    let testResultsDesc = "İnteraktif test verisi yok.";
    if (profile.testResults && Object.keys(profile.testResults).length > 0) {
        testResultsDesc = "TEST SONUÇLARI (% Doğruluk):\n";
        for(const [key, result] of Object.entries(profile.testResults)) {
            const typedResult = result as { name: string; accuracy: number };
            testResultsDesc += `- ${typedResult.name} (${key}): %${typedResult.accuracy.toFixed(1)}\n`;
        }
    }

    const prompt = `
    [ROL: EĞİTİM PSİKOLOĞU VE ÖLÇME DEĞERLENDİRME UZMANI - GEMINI 3 FLASH THINKING]
    
    GÖREV: Öğrenci profili ve test sonuçlarını analiz ederek profesyonel bir gelişim raporu oluştur.
    
    THINKING SÜRECİ:
    - Hata paternlerini incele (reversal_error, attention_lapse vb.).
    - Bu hataların bilişsel kökenlerini pedagojik olarak düşün.
    - Nokta atışı "Akıllı Rota" önerileri tasarla.

    ÖĞRENCİ: ${profile.studentName}, ${profile.age} yaş, ${profile.grade}.
    ${testResultsDesc}
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
                    attention: { type: Type.INTEGER },
                }
            },
            chartData: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.INTEGER },
                        fullMark: { type: Type.INTEGER }
                    }
                }
            },
            analysis: {
                type: Type.OBJECT,
                properties: {
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                    errorAnalysis: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            },
            roadmap: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        activityId: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        frequency: { type: Type.STRING }
                    }
                }
            }
        },
        required: ['overallSummary', 'scores', 'chartData', 'analysis', 'roadmap']
    };

    return await generateWithSchema(prompt, schema) as unknown as AssessmentReport;
};
