
<<<<<<< HEAD
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions, ShapeCountingData } from '../../types.js';
import { PEDAGOGICAL_BASE, IMAGE_GENERATION_GUIDE } from './prompts.js';

export const generateShapeCountingFromAI = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const {
        difficulty,
        itemCount = 24,
=======
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, ShapeCountingData } from '../../types';
import { PEDAGOGICAL_BASE, IMAGE_GENERATION_GUIDE } from './prompts';

export const generateShapeCountingFromAI = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const { 
        difficulty, 
        itemCount = 24, 
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
        targetShape = 'triangle',
        distractionLevel = 'medium',
        variant = 'standard' // 'standard' (grid) vs 'mixed' (chaotic)
    } = options as any;
<<<<<<< HEAD

=======
    
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
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
<<<<<<< HEAD
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
=======
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                correctCount: { type: Type.INTEGER },
                settings: {
                    type: Type.OBJECT,
                    properties: {
                        difficulty: { type: Type.STRING },
                        itemCount: { type: Type.NUMBER },
                        targetShape: { type: Type.STRING },
                        layoutType: { type: Type.STRING }
                    }
                },
                searchField: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            type: { type: Type.STRING },
                            color: { type: Type.STRING },
                            rotation: { type: Type.NUMBER },
                            size: { type: Type.NUMBER },
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                        },
                        required: ['type', 'color', 'x', 'y']
                    }
                },
<<<<<<< HEAD
                clues: { type: 'ARRAY', items: { type: 'STRING' } }
=======
                clues: { type: Type.ARRAY, items: { type: Type.STRING } }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
            },
            required: ['title', 'instruction', 'searchField', 'correctCount']
        }
    };

    // Fix: Removed the third argument 'gemini-3-flash-preview' as generateWithSchema only expects two arguments
    return await generateWithSchema(prompt, schema);
};
