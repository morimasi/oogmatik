
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
        [!!! KRİTİK ZORUNLULUK: 1:1 BİREBİR KLONLAMA (EXACT CLONE) !!!]
        MİMARİ DNA'da (Blueprint) yer alan HİÇBİR metni, soruyu, şıkkı, tablo içeriğini veya yönergeyi DEĞİŞTİRME!
        Senin tek görevin, oradaki dağınık yapıyı aşağıdaki JSON (WorksheetBlock) şemasına tam uyacak şekilde "dijitalleştirmektir".
        Yeni bir konu, farklı bir soru veya çeldirici ASLA üretme. Orijinal materyaldeki tüm kelimeler harfi harfine aynı olmalı.
        `
        : `
        [ROL: REMATERIALIZATION ENGINE - GEMINI 3 FLASH THINKING]
        GÖREV: Aşağıdaki TEKNİK BLUEPRINT'i (MİMARİ DNA) al ve onu BİREBİR AYNI DÜZENDE ama 100% YENİ VERİLERLE (farklı sorularla) inşa et.
        `;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    
    ${cloneInstructions}
    
    MİMARİ DNA (Görselden Çıkarılan veya Referans Alınan):
    ${blueprint}
    
    PARAMETRELER:
    - Zorluk Seviyesi: ${options.difficulty}
    - Sayfa Başı Öğe: ${options.itemCount}
    
    MİMARİ KURALLAR:
    1. Orijinal yapıdaki 'grid' (ızgara) ve 'table' (tablo) yerleşimlerini asla bozma.
    ${options.isExactClone ? "2. ORİJİNAL VERİLERİN, KELİMELERİN VE SAYILARIN TAMAMINI KORU." : "2. Mevcut çeldirici mantığını (reversal, omission vb.) yeni verilere uyarla."}
    3. Üretimden önce mimarinin yapısal bütünlüğünü 4000 token bütçesiyle düşün.
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
                                    description: "Blok içeriği. Kurallar: " +
                                        "grid: {cells: string[], cols: number}; " +
                                        "table: {headers: string[], rows: string[][]}; " +
                                        "text/header/cloze_test: {text: string}; " +
                                        "match_columns: {left: string[], right: string[]}; " +
                                        "categorical_sorting: {categories: string[], items: {label: string, category: string}[]}; " +
                                        "logic_card: {text: string, data: string[][], options: string[]}; " +
                                        "footer_validation: {text: string, targetValue: string};"
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
