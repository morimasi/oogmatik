
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions, HiddenPasswordGridData } from '../../types.js';

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
        type: 'ARRAY',
        items: {
            type: 'OBJECT',
            properties: {
                title: { type: 'STRING' },
                instruction: { type: 'STRING' },
                settings: {
                    type: 'OBJECT',
                    properties: {
                        gridSize: { type: 'NUMBER' },
                        itemCount: { type: 'NUMBER' },
                        cellStyle: { type: 'STRING' },
                        letterCase: { type: 'STRING' }
                    }
                },
                grids: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            targetLetter: { type: 'STRING' },
                            hiddenWord: { type: 'STRING' },
                            grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } }
                        },
                        required: ['targetLetter', 'hiddenWord', 'grid']
                    }
                }
            },
            required: ['title', 'instruction', 'grids']
        }
    };

    const rawResult = await generateWithSchema(prompt, schema);
    
    // Güvenli dizi dönüşümü
    let result: any[] = [];
    if (Array.isArray(rawResult)) {
        result = rawResult;
    } else if (rawResult && typeof rawResult === 'object') {
        const potential = (rawResult as any).items || (rawResult as any).data || (rawResult as any).grids;
        result = Array.isArray(potential) ? potential : [rawResult];
    }

    return result.filter(p => p && typeof p === 'object').map((page: any) => ({
        title: (page.title as string) ?? 'Gizli Şifre Matrisi',
        instruction: (page.instruction as string) ?? 'Şifreyi bulmak için harfleri takip et.',
        grids: Array.isArray(page.grids) ? page.grids : [],
        settings: {
            gridSize,
            itemCount,
            cellStyle: options.variant || 'square',
            letterCase: letterCase || 'upper'
        }
    }));
};
