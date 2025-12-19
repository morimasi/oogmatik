
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { MathStudioConfig, MathStudioData } from '../../types';

export const generateMathProblemsAI = async (config: MathStudioConfig): Promise<MathStudioData> => {
    const prompt = `
    [ROL: ÖZEL ÖĞRENME GÜÇLÜĞÜ (DİSKALKULİ) MATEMATİK UZMANI]
    
    GÖREV: ${config.gradeLevel} seviyesindeki, ${config.studentName ? config.studentName + ' adlı' : ''} bir öğrenci için **pedagojik değeri yüksek**, **güncel**, **gerçek hayatla ilişkili** ve **disleksi/diskalkuli dostu** matematik problemleri üret.
    
    YAPILANDIRMA:
    - İşlem Türleri: ${config.operations.join(', ')}
    - Konu/Tema: "${config.problemTopic || 'Günlük Yaşam'}"
    - Problem Sayısı: ${config.problemCount}
    - Problem Zorluğu: ${config.problemSteps} aşamalı işlem gerektirir.
    
    PEDAGOJİK KURALLAR (HAYATİ ÖNEMLİ):
    1. **Dil:** Kısa, net, devrik olmayan cümleler kullan. Gereksiz sıfatlardan kaçın.
    2. **Somutlaştırma:** Problemler soyut sayılarla değil; elma, para, oyuncak, otobüs yolcusu gibi somut nesnelerle kurgulanmalıdır.
    3. **Senaryolar:** Güncel çocuk dünyasına hitap et (Örn: Minecraft blokları, Kantin alışverişi, YouTube izlenme sayısı, Futbol maçı skoru).
    4. **Saygı ve Pozitiflik:** Başarısızlık değil, çözüm odaklı bir dil kullan.
    5. **Tutarlılık:** Çıkan sonuçlar mantıklı olmalıdır (Örn: Bir sınıfta 500 öğrenci olamaz).
    
    ÇIKTI FORMATI (JSON):
    {
        "title": "Çekici bir başlık (Örn: Uzay Macerası Matematiği)",
        "pedagogicalNote": "Öğretmen/Veli için bu setin hangi bilişsel beceriyi (örn: sayı hissi, problem çözme stratejisi) desteklediğine dair kısa akademik not.",
        "instruction": "Öğrenciye yönelik cesaretlendirici, kısa yönerge.",
        "problems": [
            {
                "text": "Problem metni...",
                "answer": Sayısal cevap (Number),
                "steps": ["1. Adım: ...", "2. Adım: ..."] (Çözüm yolunu basitçe anlatan adımlar)
            }
        ]
    }
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            instruction: { type: Type.STRING },
            problems: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        answer: { type: Type.NUMBER },
                        steps: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['text', 'answer']
                }
            }
        },
        required: ['title', 'problems', 'instruction', 'pedagogicalNote']
    };

    // Cast response to correct type intersection
    const result = await generateWithSchema(prompt, schema);
    return result as any; // Cast to MathStudioData
};
