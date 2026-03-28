
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';
import {
    FindTheDifferenceData, _WordComparisonData, _ShapeMatchingData, _FindIdenticalWordData, _GridDrawingData, _SymbolCipherData, _BlockPaintingData, VisualOddOneOutData, _SymmetryDrawingData, _FindDifferentStringData, _DotPaintingData, _AbcConnectData, _CoordinateCipherData, _WordConnectData, _ProfessionConnectData, _MatchstickSymmetryData, _VisualOddOneOutThemedData, _PunctuationColoringData, _SynonymAntonymColoringData, _StarHuntData, _ShapeType, _ShapeCountingData, _MapInstructionData
} from '../../types';
import { _ocrService } from '../ocrService.js';
import { _MAP_DETECTIVE_PROMPT, PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts.js';

export const generateVisualOddOneOutFromAI = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { difficulty, _worksheetCount, visualType, distractionLevel, gridSize, studentContext } = options;

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
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            rows: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        items: {
                            type: 'ARRAY',
                            items: {
                                type: 'OBJECT',
                                properties: {
                                    svgPaths: { type: 'ARRAY', items: { type: 'OBJECT', properties: { d: { type: 'STRING' }, fill: { type: 'STRING' }, stroke: { type: 'STRING' } } } },
                                    label: { type: 'STRING' },
                                    rotation: { type: 'NUMBER' },
                                    isMirrored: { type: 'BOOLEAN' }
                                }
                            }
                        },
                        correctIndex: { type: 'INTEGER' },
                        reason: { type: 'STRING' },
                        clinicalMeta: {
                            type: 'OBJECT',
                            properties: {
                                targetedError: { type: 'STRING' },
                                cognitiveLoad: { type: 'NUMBER' }
                            }
                        }
                    }
                }
            }
        },
        required: ["title", "instruction", "rows", "pedagogicalNote"]
    };

    const schema = { type: 'ARRAY', items: singleSchema };
    // Fix: Using stable gemini-3-flash for maximum speed and cost efficiency
    return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutData[]>;
};

export const generateFindTheDifferenceFromAI = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { difficulty, _worksheetCount, findDiffType, itemCount = 5, studentContext } = options;

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
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            gridA: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
            gridB: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
            diffCount: { type: 'INTEGER' },
            rows: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        items: { type: 'ARRAY', items: { type: 'STRING' } },
                        clinicalMeta: { type: 'OBJECT', properties: { errorType: { type: 'STRING' } } }
                    }
                }
            }
        },
        required: ["title", "instruction", "gridA", "gridB", "diffCount"]
    };

    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindTheDifferenceData[]>;
};


