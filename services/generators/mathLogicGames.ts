
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, NumberLogicRiddleData } from '../../types';
import { getMathPrompt } from './prompts';

export const generateNumberLogicRiddlesFromAI = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const { difficulty, itemCount = 6, gridSize = 3, studentContext } = options;
    
    const rule = `
    [KRİTİK GÖREV: YÜKSEK HASSASİYETLİ SAYİSAL ANALİZ]
    1. Üretilecek Bilmece Sayısı: TAM OLARAK ${itemCount} ADET.
    2. İPUCU SAYISI (riddleParts): HER BİR BİLMECE İÇİNDE KESİNLİKLE VE TAM OLARAK ${gridSize} ADET BENZERSİZ İPUCU OLMALIDIR. 
       - Eğer ${gridSize} seçildiyse, dizi uzunluğu ${gridSize} olmalıdır. Eksik veya fazla üretim kabul edilemez.
    
    [ZORLUK STRATEJİSİ: ${difficulty}]
    - Başlangıç: Basit parite ve 10'luk dilimler.
    - Orta: Bölünebilme (2, 5, 10), rakam toplamı, büyüktür/küçüktür.
    - Zor: Asal bölenler, 3 ve 4 ile bölünebilme, basamak farkları, karesel sayılara yakınlık.
    - Uzman: Çok katmanlı filtreleme. İpuçları öyle kurgulanmalı ki, son ipucuna kadar en az 2 şık arasında kalınmalı.

    [ŞIKLAR (options)]
    - Şıklar birbirine matematiksel olarak çok yakın olmalı. Cevap 24 ise şıklar [22, 24, 26, 28] gibi olmalıdır.
    `;

    const prompt = getMathPrompt(`Sayısal Dedektiflik Lab (Soru: ${itemCount}, İpucu: ${gridSize})`, difficulty, rule, studentContext);

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                sumTarget: { type: Type.INTEGER },
                puzzles: {
                    type: Type.ARRAY,
                    description: `Dizi uzunluğu tam olarak ${itemCount} olmalı.`,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            riddleParts: {
                                type: Type.ARRAY,
                                description: `BU DİZİ TAM OLARAK ${gridSize} ADET OBJE İÇERMELİDİR.`,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        text: { type: Type.STRING, description: "Kısa ve eylemsel ipucu cümlesi." },
                                        icon: { type: Type.STRING, description: "FontAwesome ikon kodu (örn: fa-microchip, fa-dna)" },
                                        type: { type: Type.STRING, enum: ['parity', 'digits', 'comparison', 'arithmetic', 'range'] }
                                    },
                                    required: ['text', 'icon', 'type']
                                }
                            },
                            visualDistraction: { type: Type.ARRAY, items: { type: Type.INTEGER }, description: "Arka plan için 5-6 adet rastgele sayı." },
                            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 adet birbirine yakın seçenek." },
                            answer: { type: Type.STRING },
                            answerValue: { type: Type.INTEGER }
                        },
                        required: ['riddleParts', 'options', 'answer', 'answerValue', 'visualDistraction']
                    }
                }
            }
        }
    };

    // Fix: Removed the third argument 'gemini-3-flash-preview' as generateWithSchema only expects two arguments
    return await generateWithSchema(prompt, schema);
};
