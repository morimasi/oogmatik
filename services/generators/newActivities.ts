
<<<<<<< HEAD
import { generateCreativeMultimodal } from '../geminiClient.js';
import { GeneratorOptions, ActivityType } from '../../types.js';
import { PEDAGOGICAL_BASE } from './prompts.js';
=======
import { Type } from "@google/genai";
import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, ActivityType } from '../../types';
import { PEDAGOGICAL_BASE } from './prompts';
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060

/**
 * generateFromRichPrompt:
 * Gemini 3 Flash 'Thinking' motoruyla bir görselin mimari DNA'sından 
 * tamamen yeni ama aynı düzende bir içerik üretir.
 */
export const generateFromRichPrompt = async (activityType: ActivityType, blueprint: string, options: GeneratorOptions & { isExactClone?: boolean }): Promise<any> => {
    const cloneInstructions = options.isExactClone
        ? `
        [!!! KRİTİK ZORUNLULUK: 1:1 MEKANİK DİJİTALLEŞTİRME !!!]
        MİMARİ DNA'da (Blueprint) yer alan HİÇBİR metni, soruyu, şıkkı, tablo içeriğini veya yönergeyi DEĞİŞTİRME, ATLATMA, ÖZETLEME!
        Senin görevin bir "OCR-to-Layout" motoru gibi davranmaktır.
        - Eğer bir tablo varsa, tüm satır ve sütunlarını 'table' bloğu olarak aktar.
        - Eğer bir grid varsa, tüm hücrelerini 'grid' bloğu olarak aktar.
        - Hiçbir 'content' objesini boş bırakma. ({}) dönmek KESİNLİKLE YASAKTIR.
        - Orijinal materyaldeki tüm kelimeler harfi harfine aynı olmalı.
        - Sayfa düzeni (sütun sayısı vb.) birebir aynı olmalı.
        `
        : `
        [ROL: REMATERIALIZATION ENGINE - GEMINI 3 FLASH THINKING]
        GÖREV: Aşağıdaki TEKNİK BLUEPRINT'i (MİMARİ DNA) al ve onu BİREBİR AYNI DÜZENDE ama 100% YENİ VERİLERLE (farklı sorularla) inşa et.
        - Yapısal sadakat (Structural Integrity) %100 korunmalı.
        `;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    
    ${cloneInstructions}
    
    MİMARİ DNA (Görselden Çıkarılan veya Referans Alınan):
    ${blueprint}
    
    PARAMETRELER:
    - Zorluk Seviyesi: ${options.difficulty} (Sadece yeni içerik üretiminde geçerli)
    - Sayfa Başı Öğe: ${options.itemCount}
    
    MİMARİ KURALLAR:
    1. Orijinal yapıdaki 'grid' (ızgara) ve 'table' (tablo) yerleşimlerini asla bozma.
    ${options.isExactClone ? "2. ORİJİNAL VERİLERİN, KELİMELERİN VE SAYILARIN TAMAMINI KESİNTİSİZ KORU. 'content' OBJELERİNİ EKSİKSİZ DOLDUR." : "2. Mevcut çeldirici mantığını (reversal, omission vb.) yeni verilere uyarla."}
    3. Üretimden önce mimarinin yapısal bütünlüğünü 4000 token bütçesiyle düşün.
    4. layoutArchitecture.cols değerini orijinal sayfa düzenine göre belirle (1 veya 2).
    `;

    const schema = {
<<<<<<< HEAD
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            layoutArchitecture: {
                type: 'OBJECT',
                properties: {
                    cols: { type: 'INTEGER', description: "Sayfadaki sütun sayısı (1-2)" },
                    blocks: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                type: {
                                    type: 'STRING',
=======
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            layoutArchitecture: {
                type: Type.OBJECT,
                properties: {
                    cols: { type: Type.INTEGER, description: "Sayfadaki sütun sayısı (1-2)" },
                    blocks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                                    enum: [
                                        'header', 'text', 'grid', 'table', 'logic_card', 'image',
                                        'footer_validation', 'cloze_test', 'categorical_sorting',
                                        'match_columns', 'visual_clue_card', 'neuro_marker', 'svg_shape'
                                    ]
                                },
                                content: {
<<<<<<< HEAD
                                    type: 'OBJECT',
                                    properties: {
                                        // Grid/Table
                                        cells: { type: 'ARRAY', items: { type: 'STRING' } },
                                        cols: { type: 'INTEGER' },
                                        headers: { type: 'ARRAY', items: { type: 'STRING' } },
                                        rows: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
                                        // Text/Header
                                        text: { type: 'STRING' },
                                        // Match/Sorting
                                        left: { type: 'ARRAY', items: { type: 'STRING' } },
                                        right: { type: 'ARRAY', items: { type: 'STRING' } },
                                        categories: { type: 'ARRAY', items: { type: 'STRING' } },
                                        items: {
                                            type: 'ARRAY',
                                            items: {
                                                type: 'OBJECT',
                                                properties: {
                                                    label: { type: 'STRING' },
                                                    category: { type: 'STRING' },
                                                    root: { type: 'STRING' },
                                                    suffixes: { type: 'ARRAY', items: { type: 'STRING' } },
                                                    hint: { type: 'STRING' }
=======
                                    type: Type.OBJECT,
                                    properties: {
                                        // Grid/Table
                                        cells: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        cols: { type: Type.INTEGER },
                                        headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                                        // Text/Header
                                        text: { type: Type.STRING },
                                        // Match/Sorting
                                        left: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        right: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        categories: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        items: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    label: { type: Type.STRING },
                                                    category: { type: Type.STRING },
                                                    root: { type: Type.STRING },
                                                    suffixes: { type: Type.ARRAY, items: { type: Type.STRING } },
                                                    hint: { type: Type.STRING }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                                                }
                                            }
                                        },
                                        // Logic Card
<<<<<<< HEAD
                                        data: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
                                        options: { type: 'ARRAY', items: { type: 'STRING' } },
                                        // Footer/Clue
                                        targetValue: { type: 'STRING' },
                                        clue: { type: 'STRING' },
                                        title: { type: 'STRING' },
                                        icon: { type: 'STRING' },
                                        // Visual & Verbal Specialist Settings
                                        gridDim: { type: 'INTEGER' },
                                        grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
                                        words: { type: 'ARRAY', items: { type: 'STRING' } },
                                        clues: {
                                            type: 'ARRAY',
                                            items: {
                                                type: 'OBJECT',
                                                properties: {
                                                    id: { type: 'INTEGER' },
                                                    text: { type: 'STRING' },
                                                    direction: { type: 'STRING', enum: ['across', 'down'] },
                                                    row: { type: 'INTEGER' },
                                                    col: { type: 'INTEGER' }
=======
                                        data: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        // Footer/Clue
                                        targetValue: { type: Type.STRING },
                                        clue: { type: Type.STRING },
                                        title: { type: Type.STRING },
                                        icon: { type: Type.STRING },
                                        // Visual & Verbal Specialist Settings
                                        gridDim: { type: Type.INTEGER },
                                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                                        words: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        clues: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    id: { type: Type.INTEGER },
                                                    text: { type: Type.STRING },
                                                    direction: { type: Type.STRING, enum: ['across', 'down'] },
                                                    row: { type: Type.INTEGER },
                                                    col: { type: Type.INTEGER }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                                                }
                                            }
                                        },
                                        sections: {
<<<<<<< HEAD
                                            type: 'ARRAY',
                                            items: {
                                                type: 'OBJECT',
                                                properties: {
                                                    searchField: { type: 'ARRAY', items: { type: 'OBJECT', properties: { id: { type: 'STRING' }, type: { type: 'STRING' }, color: { type: 'STRING' }, rotation: { type: 'NUMBER' }, size: { type: 'NUMBER' }, x: { type: 'NUMBER' }, y: { type: 'NUMBER' } } } },
                                                    correctCount: { type: 'INTEGER' },
                                                    title: { type: 'STRING' },
                                                    clinicalMeta: { type: 'OBJECT', properties: { figureGroundComplexity: { type: 'NUMBER' }, overlappingRatio: { type: 'NUMBER' } } }
=======
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    searchField: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, type: { type: Type.STRING }, color: { type: Type.STRING }, rotation: { type: Type.NUMBER }, size: { type: Type.NUMBER }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } } },
                                                    correctCount: { type: Type.INTEGER },
                                                    title: { type: Type.STRING },
                                                    clinicalMeta: { type: Type.OBJECT, properties: { figureGroundComplexity: { type: Type.NUMBER }, overlappingRatio: { type: Type.NUMBER } } }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                                                }
                                            }
                                        },
                                        puzzles: {
<<<<<<< HEAD
                                            type: 'ARRAY',
                                            items: {
                                                type: 'OBJECT',
                                                properties: {
                                                    grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
                                                    path: { type: 'ARRAY', items: { type: 'STRING' } },
                                                    startPos: { type: 'OBJECT', properties: { r: { type: 'INTEGER' }, c: { type: 'INTEGER' } } },
                                                    targetWord: { type: 'STRING' },
                                                    title: { type: 'STRING' },
                                                    clinicalMeta: { type: 'OBJECT', properties: { perceptualLoad: { type: 'NUMBER' }, attentionShiftCount: { type: 'INTEGER' } } }
=======
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                                                    path: { type: Type.ARRAY, items: { type: Type.STRING } },
                                                    startPos: { type: Type.OBJECT, properties: { r: { type: Type.INTEGER }, c: { type: Type.INTEGER } } },
                                                    targetWord: { type: Type.STRING },
                                                    title: { type: Type.STRING },
                                                    clinicalMeta: { type: Type.OBJECT, properties: { perceptualLoad: { type: Type.NUMBER }, attentionShiftCount: { type: Type.INTEGER } } }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                                                }
                                            }
                                        },
                                        drawings: {
<<<<<<< HEAD
                                            type: 'ARRAY',
                                            items: {
                                                type: 'OBJECT',
                                                properties: {
                                                    lines: { type: 'ARRAY', items: { type: 'OBJECT', properties: { x1: { type: 'NUMBER' }, y1: { type: 'NUMBER' }, x2: { type: 'NUMBER' }, y2: { type: 'NUMBER' } } } },
                                                    dots: { type: 'ARRAY', items: { type: 'OBJECT', properties: { x: { type: 'NUMBER' }, y: { type: 'NUMBER' } } } },
                                                    title: { type: 'STRING' },
                                                    clinicalMeta: { type: 'OBJECT', properties: { asymmetryIndex: { type: 'NUMBER' }, complexity: { type: 'NUMBER' }, targetCognitiveSkill: { type: 'STRING' } } }
=======
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    lines: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x1: { type: Type.NUMBER }, y1: { type: Type.NUMBER }, x2: { type: Type.NUMBER }, y2: { type: Type.NUMBER } } } },
                                                    dots: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } } },
                                                    title: { type: Type.STRING },
                                                    clinicalMeta: { type: Type.OBJECT, properties: { asymmetryIndex: { type: Type.NUMBER }, complexity: { type: Type.NUMBER }, targetCognitiveSkill: { type: Type.STRING } } }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                                                }
                                            }
                                        },
                                        settings: {
<<<<<<< HEAD
                                            type: 'OBJECT',
                                            properties: {
                                                difficulty: { type: 'STRING', enum: ['beginner', 'intermediate', 'expert', 'clinical'] },
                                                layout: { type: 'STRING', enum: ['classic', 'compact', 'ultra_dense', 'single', 'grid_2x1', 'grid_2x2', 'side_by_side', 'stacked', 'grid_compact', 'protocol', 'grid', 'rows'] },
                                                gridType: { type: 'STRING', enum: ['dots', 'squares', 'crosses'] },
                                                axis: { type: 'STRING', enum: ['vertical', 'horizontal', 'diagonal'] },
                                                itemType: { type: 'STRING', enum: ['svg', 'text', 'image', 'character'] },
                                                subType: { type: 'STRING', enum: ['character_discrimination', 'symbolic_logic', 'object_recognition', 'letter-cancellation'] },
                                                category: { type: 'STRING', enum: ['letters', 'numbers', 'colors', 'objects', 'mixed'] },
                                                targetShape: { type: 'STRING' },
                                                theme: { type: 'STRING', enum: ['classic', 'modern', 'minimal'] },
                                                overlapping: { type: 'BOOLEAN' },
                                                rotationEnabled: { type: 'BOOLEAN' },
                                                pathComplexity: { type: 'NUMBER' },
                                                directions: { type: 'ARRAY', items: { type: 'STRING' } },
                                                gridSize: { type: 'INTEGER' },
                                                fontScale: { type: 'NUMBER' },
                                                showGhostPoints: { type: 'BOOLEAN' },
                                                showCoordinates: { type: 'BOOLEAN' },
                                                showClinicalNotes: { type: 'BOOLEAN' },
                                                isProfessionalMode: { type: 'BOOLEAN' }
                                            }
                                        },
                                        clinicalMeta: {
                                            type: 'OBJECT',
                                            properties: {
                                                intersections: { type: 'INTEGER' },
                                                reversals: { type: 'INTEGER' },
                                                density: { type: 'NUMBER' },
                                                crossingPoints: { type: 'INTEGER' },
                                                isSymmetric: { type: 'BOOLEAN' },
                                                connectivityIndex: { type: 'NUMBER' },
                                                clueComplexity: { type: 'NUMBER' },
                                                vocabularyLevel: { type: 'STRING' },
                                                morphologicalComplexity: { type: 'NUMBER' },
                                                derivationalVariety: { type: 'NUMBER' },
                                                discriminationFactor: { type: 'NUMBER' },
                                                isMirrorTask: { type: 'BOOLEAN' },
                                                targetCognitiveSkill: { type: 'STRING' },
                                                targetSpeed: { type: 'NUMBER' },
                                                interferenceFactor: { type: 'NUMBER' },
                                                perceptualLoad: { type: 'NUMBER' },
                                                visualSearchEfficiency: { type: 'NUMBER' }
=======
                                            type: Type.OBJECT,
                                            properties: {
                                                difficulty: { type: Type.STRING, enum: ['beginner', 'intermediate', 'expert', 'clinical'] },
                                                layout: { type: Type.STRING, enum: ['classic', 'compact', 'ultra_dense', 'single', 'grid_2x1', 'grid_2x2', 'side_by_side', 'stacked', 'grid_compact', 'protocol', 'grid', 'rows'] },
                                                gridType: { type: Type.STRING, enum: ['dots', 'squares', 'crosses'] },
                                                axis: { type: Type.STRING, enum: ['vertical', 'horizontal', 'diagonal'] },
                                                itemType: { type: Type.STRING, enum: ['svg', 'text', 'image', 'character'] },
                                                subType: { type: Type.STRING, enum: ['character_discrimination', 'symbolic_logic', 'object_recognition', 'letter-cancellation'] },
                                                category: { type: Type.STRING, enum: ['letters', 'numbers', 'colors', 'objects', 'mixed'] },
                                                targetShape: { type: Type.STRING },
                                                theme: { type: Type.STRING, enum: ['classic', 'modern', 'minimal'] },
                                                overlapping: { type: Type.BOOLEAN },
                                                rotationEnabled: { type: Type.BOOLEAN },
                                                pathComplexity: { type: Type.NUMBER },
                                                directions: { type: Type.ARRAY, items: { type: Type.STRING } },
                                                gridSize: { type: Type.INTEGER },
                                                fontScale: { type: Type.NUMBER },
                                                showGhostPoints: { type: Type.BOOLEAN },
                                                showCoordinates: { type: Type.BOOLEAN },
                                                showClinicalNotes: { type: Type.BOOLEAN },
                                                isProfessionalMode: { type: Type.BOOLEAN }
                                            }
                                        },
                                        clinicalMeta: {
                                            type: Type.OBJECT,
                                            properties: {
                                                intersections: { type: Type.INTEGER },
                                                reversals: { type: Type.INTEGER },
                                                density: { type: Type.NUMBER },
                                                crossingPoints: { type: Type.INTEGER },
                                                isSymmetric: { type: Type.BOOLEAN },
                                                connectivityIndex: { type: Type.NUMBER },
                                                clueComplexity: { type: Type.NUMBER },
                                                vocabularyLevel: { type: Type.STRING },
                                                morphologicalComplexity: { type: Type.NUMBER },
                                                derivationalVariety: { type: Type.NUMBER },
                                                discriminationFactor: { type: Type.NUMBER },
                                                isMirrorTask: { type: Type.BOOLEAN },
                                                targetCognitiveSkill: { type: Type.STRING },
                                                targetSpeed: { type: Type.NUMBER },
                                                interferenceFactor: { type: Type.NUMBER },
                                                perceptualLoad: { type: Type.NUMBER },
                                                visualSearchEfficiency: { type: Type.NUMBER }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                                            }
                                        }
                                    },
                                    description: "Blok içeriği. Seçilen 'type'a uygun alanları KESİNLİKLE doldurmalısın."
                                },
<<<<<<< HEAD
                                weight: { type: 'INTEGER' }
=======
                                weight: { type: Type.INTEGER }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                            },
                            required: ['type', 'content']
                        }
                    }
                },
                required: ['blocks']
            }
        },
        required: ['title', 'instruction', 'layoutArchitecture']
    };

    // geminiClient zaten MASTER_MODEL ve Thinking bütçesini kullanacak şekilde ayarlandı.
    return await generateCreativeMultimodal({ prompt, schema });
};
