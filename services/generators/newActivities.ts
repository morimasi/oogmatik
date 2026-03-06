
import { Type } from "@google/genai";
import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, ActivityType } from '../../types';
import { PEDAGOGICAL_BASE } from './prompts';

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
                                    enum: [
                                        'header', 'text', 'grid', 'table', 'logic_card', 'image',
                                        'footer_validation', 'cloze_test', 'categorical_sorting',
                                        'match_columns', 'visual_clue_card', 'neuro_marker', 'svg_shape'
                                    ]
                                },
                                content: {
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
                                                    category: { type: Type.STRING }
                                                }
                                            }
                                        },
                                        // Logic Card
                                        data: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        // Footer/Clue
                                        targetValue: { type: Type.STRING },
                                        clue: { type: Type.STRING },
                                        title: { type: Type.STRING },
                                        icon: { type: Type.STRING },
                                        // Visual Specialist Settings
                                        gridDim: { type: Type.INTEGER },
                                        drawings: {
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    lines: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.NUMBER } } } },
                                                    title: { type: Type.STRING }
                                                }
                                            }
                                        },
                                        settings: {
                                            type: Type.OBJECT,
                                            properties: {
                                                difficulty: { type: Type.STRING, enum: ['beginner', 'intermediate', 'expert', 'clinical'] },
                                                differenceType: { type: Type.STRING },
                                                itemType: { type: Type.STRING },
                                                layout: { type: Type.STRING, enum: ['single', 'grid_compact', 'ultra_dense', 'side_by_side', 'stacked'] },
                                                gridType: { type: Type.STRING, enum: ['dots', 'squares', 'crosses'] },
                                                transformMode: { type: Type.STRING },
                                                showCoordinates: { type: Type.BOOLEAN },
                                                isProfessionalMode: { type: Type.BOOLEAN }
                                            }
                                        },
                                        clinicalMeta: {
                                            type: Type.OBJECT,
                                            properties: {
                                                errorType: { type: Type.STRING },
                                                rotationAngle: { type: Type.INTEGER },
                                                isMirrored: { type: Type.BOOLEAN },
                                                strokeDifference: { type: Type.STRING },
                                                crossingPoints: { type: Type.INTEGER },
                                                isSymmetric: { type: Type.BOOLEAN }
                                            }
                                        }
                                    },
                                    description: "Blok içeriği. Seçilen 'type'a uygun alanları KESİNLİKLE doldurmalısın."
                                },
                                weight: { type: Type.INTEGER }
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
