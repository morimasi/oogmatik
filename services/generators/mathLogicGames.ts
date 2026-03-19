
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions, NumberLogicRiddleData } from '../../types.js';
import { getMathPrompt } from './prompts.js';

export const generateNumberLogicRiddlesFromAI = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const { difficulty = 'Orta', itemCount = 6, gridSize = 3, studentContext } = options;

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
        type: 'ARRAY',
        items: {
            type: 'OBJECT',
            properties: {
                title: { type: 'STRING' },
                instruction: { type: 'STRING' },
                pedagogicalNote: { type: 'STRING' },
                sumTarget: { type: 'INTEGER' },
                puzzles: {
                    type: 'ARRAY',
                    description: `Dizi uzunluğu tam olarak ${itemCount} olmalı.`,
                    items: {
                        type: 'OBJECT',
                        properties: {
                            id: { type: 'STRING' },
                            riddleParts: {
                                type: 'ARRAY',
                                description: `BU DİZİ TAM OLARAK ${gridSize} ADET OBJE İÇERMELİDİR.`,
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        text: { type: 'STRING', description: "Kısa ve eylemsel ipucu cümlesi." },
                                        icon: { type: 'STRING', description: "FontAwesome ikon kodu (örn: fa-microchip, fa-dna)" },
                                        type: { type: 'STRING', enum: ['parity', 'digits', 'comparison', 'arithmetic', 'range'] }
                                    },
                                    required: ['text', 'icon', 'type']
                                }
                            },
                            visualDistraction: { type: 'ARRAY', items: { type: 'INTEGER' }, description: "Arka plan için 5-6 adet rastgele sayı." },
                            options: { type: 'ARRAY', items: { type: 'STRING' }, description: "4 adet birbirine yakın seçenek." },
                            answer: { type: 'STRING' },
                            answerValue: { type: 'INTEGER' }
                        },
                        required: ['riddleParts', 'options', 'answer', 'answerValue', 'visualDistraction']
                    }
                }
            }
        }
    };

    // Using stable gemini-1.5-flash for reliability
    const result = await generateWithSchema(prompt, schema);
    return result;
};
