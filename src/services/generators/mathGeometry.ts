
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions, ShapeCountingData } from '../../types.js';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE, SHAPE_COUNTING_CORE_GUIDE } from './prompts.js';

export const generateShapeCountingFromAI = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const {
        difficulty,
        itemCount = 40,
        targetShape = 'triangle',
        variant = 'mixed',
        overlapping = true,
        aestheticMode = 'glassmorphism',
        layout = 'single'
    } = options as any;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    ${SHAPE_COUNTING_CORE_GUIDE}
    
    GÖREV: [ULTRA-PROFESYONEL GÖRSEL TARAMA & FİGÜR-ZEMİN ALGISI TESTİ]
    
    PARAMETRELER:
    - Hedef Şekil: ${targetShape} (Öğrenci bu şekli sayacak).
    - Toplam Nesne Sayısı: ${itemCount}.
    - Yerleşim Stili: ${variant === 'mixed' ? 'Kaotik/Karmaşık (Chaotic)' : 'Düzenli Izgara (Grid)'}.
    - Üst Üste Binme (Overlapping): ${overlapping ? 'EVET (Teşvik et, iç içe geçsinler)' : 'HAYIR'}.
    - Zorluk Seviyesi: ${difficulty}.
    - Estetik Mod: ${aestheticMode}.
    - A4 Yerleşim: ${layout}.
    
    STRATEJİ:
    1. [KRİTİK]: Şekillerin birbirinin üzerine binmesine, iç içe geçmesine ve yoğun kümelenmesine izin ver. Bu, figür-zemin ayırt etme becerisini ölçer.
    2. Hedef şekil olan "${targetShape}" nesnelerini toplam nesne sayısının yaklaşık %25-30'u kadar üret.
    3. Diğer nesneleri (circle, square, star, hexagon, pentagon, diamond) güçlü çeldiriciler olarak kullan.
    4. Koordinatlar (x, y) 0-100 arasındadır. Yoğun kümeler oluşturmak için nesneleri birbirine yakın koordinatlara yerleştir.
    5. Rotasyon (0-360) ve Boyut (0.5 - 1.5) çeşitliliği ile karmaşıklığı artır.
    
    ÇIKTI BİLGİSİ:
    - correctCount: Hedef şeklin tam adedi.
    - searchField: Nesne listesi (x, y, type, color, rotation, size).
    - clinicalMeta: { figureGroundComplexity: number (1-10), overlappingRatio: number (0-1) }.
    `;

    const schema = {
        type: 'ARRAY',
        items: {
            type: 'OBJECT',
            properties: {
                title: { type: 'STRING' },
                instruction: { type: 'STRING' },
                pedagogicalNote: { type: 'STRING' },
                correctCount: { type: 'INTEGER' },
                settings: {
                    type: 'OBJECT',
                    properties: {
                        difficulty: { type: 'STRING' },
                        itemCount: { type: 'NUMBER' },
                        targetShape: { type: 'STRING' },
                        layout: { type: 'STRING' },
                        overlapping: { type: 'BOOLEAN' },
                        aestheticMode: { type: 'STRING' }
                    }
                },
                searchField: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            id: { type: 'STRING' },
                            type: { type: 'STRING' },
                            color: { type: 'STRING' },
                            rotation: { type: 'NUMBER' },
                            size: { type: 'NUMBER' },
                            x: { type: 'NUMBER' },
                            y: { type: 'NUMBER' }
                        },
                        required: ['type', 'color', 'x', 'y']
                    }
                },
                clinicalMeta: {
                    type: 'OBJECT',
                    properties: {
                        figureGroundComplexity: { type: 'NUMBER' },
                        overlappingRatio: { type: 'NUMBER' }
                    }
                }
            },
            required: ['title', 'instruction', 'searchField', 'correctCount']
        }
    };

    const results = await generateWithSchema(prompt, schema);
    
    // Normalize: Ensure targetShape parameter is used (override AI response if needed)
    return (results as ShapeCountingData[]).map((item: any) => ({
        ...item,
        settings: {
            ...item.settings,
            difficulty: item.settings?.difficulty || difficulty,
            itemCount: item.settings?.itemCount || itemCount,
            targetShape: targetShape, // ALWAYS use input parameter value
            layout: item.settings?.layout || layout,
            overlapping: item.settings?.overlapping !== undefined ? item.settings.overlapping : overlapping,
            aestheticMode: item.settings?.aestheticMode || aestheticMode
        }
    }));
};
