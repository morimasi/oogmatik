
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, HiddenPasswordGridData } from '../../types';

const PEDAGOGICAL_PROMPT = `
[ROL: KIDEMLİ EĞİTİM MATERYALİ TASARIMCISI]
Görevin: Disleksik çocuklar için dikkat ve görsel tarama becerilerini geliştiren materyaller üretmek.
Uzman seviyesi için:
1. Birbirine görsel olarak çok benzeyen çeldiriciler kullan (Örn: b, d, p, q veya m, n, u).
2. Tek bir çeldirici yerine 2 veya 3 farklı "hedef harf" belirle.
3. Gizli kelimeler biraz daha uzun (5-8 harf) olabilir.
4. Yönergeler kısa, net ve teşvik edici olmalıdır.
Sadece JSON döndür.
`;

export const generateHiddenPasswordGridFromAI = async (options: GeneratorOptions): Promise<HiddenPasswordGridData[]> => {
    const { topic, difficulty, worksheetCount, gridSize = 5, itemCount = 9, case: letterCase = 'upper' } = options;
    
    const isExpert = difficulty === 'Zor' || difficulty === 'Uzman';
    const targetCount = isExpert ? 3 : 1;
    
    const prompt = `
    "Gizli Şifre Matrisi" (Letter Cancellation) etkinliği üret. 
    Konu: ${topic || 'Karışık'}. Zorluk: ${difficulty}.
    
    KESİN PARAMETRELER (BU DEĞERLERE SADIK KAL):
    - Sayfa başı blok sayısı: ${itemCount}
    - Matris boyutu: TAM OLARAK ${gridSize}x${gridSize}
    - Harf Tipi: ${letterCase === 'upper' ? 'SADECE BÜYÜK HARFLER' : 'SADECE KÜÇÜK HARFLER'}
    
    KURALLAR:
    1. Her blok için tam ${targetCount} adet 'targetLetters' (çeldirici harfler) seç. 
    2. Uzman modundaysan (Difficulty: ${difficulty}), çeldiricileri birbirine benzeyenlerden seç (örn: b ve d).
    3. Gizli kelimeler 3-8 harf arasında olmalı.
    4. Matrisi 'targetLetters' ile doldur, aralara gizli kelimenin harflerini soldan sağa akacak şekilde serpiştir.
    5. Her blokta 'targetLetters' ve 'hiddenWord' kullanarak tam ${gridSize}x${gridSize} bir matris oluştur.
    
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
                grids: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            targetLetters: { type: Type.ARRAY, items: { type: Type.STRING } },
                            hiddenWord: { type: Type.STRING },
                            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
                        },
                        required: ['targetLetters', 'hiddenWord', 'grid']
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
