
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions, NumberLogicRiddleData } from '../../types.js';
import { getMathPrompt } from './prompts.js';

export const generateNumberLogicRiddlesFromAI = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const customSettings = (options as any).numberLogicRiddles || {};
    const difficulty = options.difficulty || 'Orta';
    const itemCount = customSettings.itemCount || options.itemCount || 6;
    const gridSize = customSettings.gridSize || options.gridSize || 3;
    const studentContext = options.studentContext;

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
                title: { type: 'STRING', description: 'Etkinlik başlığı' },
                instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' },
                sumTarget: { type: 'INTEGER', description: 'Toplam hedef değeri' },
                puzzles: {
                    type: 'ARRAY',
                    description: `Dizi uzunluğu tam olarak ${itemCount} olmalı.`,
                    items: {
                        type: 'OBJECT',
                        properties: {
                            id: { type: 'STRING', description: 'Bulmaca benzersiz kimliği' },
                            riddleParts: {
                                type: 'ARRAY',
                                description: `BU DİZİ TAM OLARAK ${gridSize} ADET OBJE İÇERMELİDİR.`,
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        text: { type: 'STRING', description: "Kısa ve eylemsel ipucu cümlesi." },
                                        icon: { type: 'STRING', description: "FontAwesome ikon kodu (örn: fa-microchip, fa-dna)" },
                                        type: { type: 'STRING', description: 'İpucu matematik türü', enum: ['parity', 'digits', 'comparison', 'arithmetic', 'range'] }
                                    },
                                    required: ['text', 'icon', 'type']
                                }
                            },
                            visualDistraction: { type: 'ARRAY', items: { type: 'INTEGER' }, description: "Arka plan için 5-6 adet rastgele sayı." },
                            options: { type: 'ARRAY', items: { type: 'STRING' }, description: "4 adet birbirine yakın seçenek." },
                            answer: { type: 'STRING', description: 'Doğru cevap metni' },
                            answerValue: { type: 'INTEGER', description: 'Doğru cevap sayısal değeri' }
                        },
                        required: ['riddleParts', 'options', 'answer', 'answerValue', 'visualDistraction']
                    }
                }
            }
        }
    };

    const rawResult = await generateWithSchema(prompt, schema);
    
    // Güvenli dizi dönüşümü
    let result: any[] = [];
    if (Array.isArray(rawResult)) {
        result = rawResult;
    } else if (rawResult && typeof rawResult === 'object') {
        const potential = (rawResult as any).items || (rawResult as any).puzzles || (rawResult as any).data;
        result = Array.isArray(potential) ? potential : [rawResult];
    }

    return result.filter(p => p && typeof p === 'object').map((p: any) => ({
        ...p,
        title: p.title || 'Sayısal Dedektiflik Lab',
        instruction: p.instruction || 'İpuçlarını takip et ve doğru sayıyı bul.',
        puzzles: Array.isArray(p.puzzles) ? p.puzzles : [],
        settings: {
            difficulty: difficulty,
            itemCount: itemCount,
            gridSize: gridSize,
            showIcons: customSettings.showIcons !== false,
            showVisualDistraction: customSettings.showVisualDistraction !== false,
            aestheticMode: customSettings.aestheticMode || 'standard'
        }
    })) as NumberLogicRiddleData[];
};
