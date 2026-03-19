
import { generateCreativeMultimodal } from '../geminiClient.js';
import { GeneratorOptions, ActivityType } from '../../types.js';
import { PEDAGOGICAL_BASE } from './prompts.js';

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
                                    enum: [
                                        'header', 'text', 'grid', 'table', 'logic_card', 'image',
                                        'footer_validation', 'cloze_test', 'categorical_sorting',
                                        'match_columns', 'visual_clue_card', 'neuro_marker', 'svg_shape'
                                    ]
                                },
                                content: {
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
                                                }
                                            }
                                        },
                                        // Logic Card
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
                                                }
                                            }
                                        },
                                        sections: {
                                            type: 'ARRAY',
                                            items: {
                                                type: 'OBJECT',
                                                properties: {
                                                    searchField: { type: 'ARRAY', items: { type: 'OBJECT', properties: { id: { type: 'STRING' }, type: { type: 'STRING' }, color: { type: 'STRING' }, rotation: { type: 'NUMBER' }, size: { type: 'NUMBER' }, x: { type: 'NUMBER' }, y: { type: 'NUMBER' } } } },
                                                    correctCount: { type: 'INTEGER' },
                                                    title: { type: 'STRING' },
                                                    clinicalMeta: { type: 'OBJECT', properties: { figureGroundComplexity: { type: 'NUMBER' }, overlappingRatio: { type: 'NUMBER' } } }
                                                }
                                            }
                                        },
                                        puzzles: {
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
                                                }
                                            }
                                        },
                                        drawings: {
                                            type: 'ARRAY',
                                            items: {
                                                type: 'OBJECT',
                                                properties: {
                                                    lines: { type: 'ARRAY', items: { type: 'OBJECT', properties: { x1: { type: 'NUMBER' }, y1: { type: 'NUMBER' }, x2: { type: 'NUMBER' }, y2: { type: 'NUMBER' } } } },
                                                    dots: { type: 'ARRAY', items: { type: 'OBJECT', properties: { x: { type: 'NUMBER' }, y: { type: 'NUMBER' } } } },
                                                    title: { type: 'STRING' },
                                                    clinicalMeta: { type: 'OBJECT', properties: { asymmetryIndex: { type: 'NUMBER' }, complexity: { type: 'NUMBER' }, targetCognitiveSkill: { type: 'STRING' } } }
                                                }
                                            }
                                        },
                                        settings: {
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
                                            }
                                        }
                                    },
                                    description: "Blok içeriği. Seçilen 'type'a uygun alanları KESİNLİKLE doldurmalısın."
                                },
                                weight: { type: 'INTEGER' }
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
