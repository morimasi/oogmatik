import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, HiddenPasswordGridData } from '../../types';

const PEDAGOGICAL_PROMPT = `
[ROL: KIDEMLİ EĞİTİM MATERYALİ TASARIMCISI]
Görevin: Disleksik çocuklar için dikkat ve görsel tarama becerilerini geliştiren materyaller üretmek.
Yönergeler kısa, net ve teşvik edici olmalıdır.
Sadece JSON döndür.
`;

export const generateHiddenPasswordGridFromAI = async (options: GeneratorOptions): Promise<HiddenPasswordGridData[]> => {
    const { topic, difficulty, worksheetCount, gridSize = 5, itemCount = 9, case: letterCase } = options;
    
    const prompt = `
    "Gizli Şifre Matrisi" (Letter Cancellation) etkinliği üret. 
    Konu: ${topic || 'Karışık'}. Zorluk: ${difficulty}.
    
    PARAMETRELER:
    - Sayfa başı blok sayısı: ${itemCount}
    - Matris boyutu: ${gridSize}x${gridSize}
    - Harf Tipi: ${letterCase === 'upper' ? 'SADECE BÜYÜK HARFLER' : 'SADECE KÜÇÜK HARFLER'}
    
    KURALLAR:
    1. Her blok için bir 'targetLetter' (çeldirici harf) seç. Bu harf gizli kelime içinde ASLA geçmemeli.
    2. Gizli kelimeler 3-7 harf arasında olmalı.
    3. Matrisi 'targetLetter' ile doldur, aralara gizli kelimenin harflerini soldan sağa akacak şekilde serpiştir.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet çalışma sayfası üret.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                settings: {
                    type: Type.OBJECT,
                    properties: {
                        gridSize: { type: Type.NUMBER },
                        itemCount: { type: Type.NUMBER },
                        cellStyle: { type: Type.STRING },
                        letterCase: { type: Type.STRING }
                    }
                },
                grids: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            targetLetter: { type: Type.STRING },
                            hiddenWord: { type: Type.STRING },
                            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
                        },
                        required: ['targetLetter', 'hiddenWord', 'grid']
                    }
                }
            },
            required: ['title', 'instruction', 'grids']
        }
    };

    const result = await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
    return result.map((page: any) => ({
        ...page,
        settings: {
            gridSize,
            itemCount,
            cellStyle: options.variant || 'square',
            letterCase: letterCase || 'upper'
        }
    }));
};
