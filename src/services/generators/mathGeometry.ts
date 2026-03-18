
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions, ShapeCountingData } from '../../types.js';
import { PEDAGOGICAL_BASE, IMAGE_GENERATION_GUIDE } from './prompts.js';

export const generateShapeCountingFromAI = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const {
        difficulty,
        itemCount = 24,
        targetShape = 'triangle',
        distractionLevel = 'medium',
        variant = 'standard' // 'standard' (grid) vs 'mixed' (chaotic)
    } = options as any;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    
    GÖREV: [GÖRSEL TARAMA & AYRIŞTIRMA ETKİNLİĞİ] - "Hedef ŞEKİLİ Bul"
    ZORLUK SEVİYESİ: ${difficulty}
    HEDEF ŞEKİL: ${targetShape} (Öğrenci bu şekli sayacak).
    TOPLAM NESNE ADEDİ: ${itemCount}
    YERLEŞİM TİPİ: ${variant === 'mixed' ? 'Kaotik (Chaotic)' : 'Düzenli Izgara (Grid)'}.

    ÜRETİM KURALLARI:
    1. searchField: ${itemCount} adet nesne üret. Bunların bir kısmı '${targetShape}' olsun, kalanı çeldirici (circle, square, star, hexagon, pentagon) olsun.
    2. Renk Havuzu: ${difficulty === 'Uzman' ? 'Birbirine yakın tonlar (Pastel)' : 'Keskin zıt renkler'}.
    3. Koordinat: x (0-95), y (0-95) değerleri arasında nesnelerin çakışmamasına dikkat et.
    4. Rotasyon: Her nesneye 0-360 arası rastgele açı ver (Özellikle üçgenler için ayırt etmeyi zorlaştırır).
    5. correctCount: Üretilen '${targetShape}' sayısını KESİN olarak hesapla.

    ÇIKTI: JSON formatında bir dizi döndür.
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
                        layoutType: { type: 'STRING' }
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
                clues: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['title', 'instruction', 'searchField', 'correctCount']
        }
    };

    // Fix: Using stable gemini-1.5-flash-latest for maximum reliability
    return await generateWithSchema(prompt, schema);
};
