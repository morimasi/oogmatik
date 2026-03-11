
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, CoordinateCipherData, WordConnectData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeType, ShapeCountingData, MapInstructionData
} from '../../types';
import { ocrService } from '../ocrService';
import { MAP_DETECTIVE_PROMPT, PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts';

export const generateVisualOddOneOutFromAI = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { difficulty, worksheetCount, visualType, distractionLevel, gridSize, studentContext } = options;

    const typeDesc = visualType === 'geometric' ? 'Karmaşık Geometrik Şekiller' :
        visualType === 'abstract' ? 'Soyut Desenler' :
            visualType === 'character' ? 'Ayna Harf ve Rakamlar (b/d, p/q, 6/9 vb.)' : 'Karmaşık poligonlar';

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    GÖREV: [ULTRA-PROFESYONEL TANISAL GÖRSEL AYRIŞTIRMA (ODD-ONE-OUT)]
    
    PARAMETRELER:
    - Mimari Tip: ${typeDesc}.
    - Zorluk: ${difficulty}.
    - Çeldirici Hassasiyeti: ${distractionLevel}.
    - Bilişsel Yük Endeksi: ${options.cognitiveLoad || 5} / 10.
    - Klinik Metrik Talebi: ${options.includeClinicalNotes ? 'AKTİF' : 'PASİF'}.
    - Satır Başı Öğe Sayısı: ${gridSize || 4}.
    - Üretilecek Satır Sayısı: 8-10 (Bol içerikli çıktı).
    - Öğrenci Profili: ${studentContext?.diagnosis?.join(', ') || 'Genel Gelişim'}.
    
    STRATEJİ:
    1. Bilişsel yük endeksi ${options.cognitiveLoad || 5} ise, şekiller arası benzerliği bu oranda artır.
    2. Her satırda farklı bir disleksi alt hatasını hedefle (örn: rotasyonel hata, aynalamalı hata, konumsal hata).
    3. [ÖNEMLİ]: "Bol içerik" talebi nedeniyle bir A4 sayfasını tamamen dolduracak kadar (en az 8 satır) veri üret.
    
    ÇIKTI FORMATI:
    - rows: [{ items: [{ svgPaths: [...], label: string, rotation: number, isMirrored: boolean }], correctIndex: number, reason: string, clinicalMeta: { targetedError: string, cognitiveLoad: number } }]
    `;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    svgPaths: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { d: { type: Type.STRING }, fill: { type: Type.STRING }, stroke: { type: Type.STRING } } } },
                                    label: { type: Type.STRING },
                                    rotation: { type: Type.NUMBER },
                                    isMirrored: { type: Type.BOOLEAN }
                                }
                            }
                        },
                        correctIndex: { type: Type.INTEGER },
                        reason: { type: Type.STRING },
                        clinicalMeta: {
                            type: Type.OBJECT,
                            properties: {
                                targetedError: { type: Type.STRING },
                                cognitiveLoad: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            }
        },
        required: ["title", "instruction", "rows", "pedagogicalNote"]
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    // Fix: Removed the third argument 'gemini-3-flash-preview' as generateWithSchema only expects two arguments
    return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutData[]>;
};

export const generateFindTheDifferenceFromAI = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { difficulty, worksheetCount, findDiffType, itemCount = 5, studentContext } = options;

    const typeDesc = findDiffType === 'word' ? 'Türkçe Kelimeler' :
        findDiffType === 'char' ? 'Karıştırılan Harfler' : 'Görsel Emojiler';

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    GÖREV: [İKİ TABLO ARASINDAKİ FARKLARI BULMA]
    
    PARAMETRELER:
    - Veri Tipi: ${typeDesc}.
    - Zorluk: ${difficulty}.
    - Hedef Fark Sayısı: ${itemCount}.
    - Öğrenci Profili: ${studentContext?.diagnosis?.join(', ') || 'Genel Gelişim'}.
    
    STRATEJİ:
    1. İki adet grid oluştur (gridA ve gridB).
    2. gridA referans tablodur, gridB ise ${itemCount} adet fark barındırır.
    3. Farklar disleksi/dikkat profiline göre seçilmelidir (örn: b yerine d, m yerine n).
    4. [KRİTİK]: Tüm metinler, kelimeler ve içerikler %100 TÜRKÇE olmalıdır. İngilizce kelime KESİNLİKLE kullanma.
    
    ÇIKTI FORMATI:
    - gridA: [[string, ...], ...]
    - gridB: [[string, ...], ...]
    - diffCount: number
    - rows: [{ items: [...], clinicalMeta: { errorType: "..." } }] (gridB'nin satır yansıması)
    `;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            gridA: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            gridB: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            diffCount: { type: Type.INTEGER },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        items: { type: Type.ARRAY, items: { type: Type.STRING } },
                        clinicalMeta: { type: Type.OBJECT, properties: { errorType: { type: Type.STRING } } }
                    }
                }
            }
        },
        required: ["title", "instruction", "gridA", "gridB", "diffCount"]
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindTheDifferenceData[]>;
};


