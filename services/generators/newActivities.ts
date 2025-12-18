
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData, MindGamesData, MindGames56Data } from '../../types';
import { ActivityType } from '../../types';

const PEDAGOGICAL_PROMPT = `
ÜST DÜZEY EĞİTİM İÇERİĞİ OLUŞTURMA YÖNERGESİ (PREMIUM KALİTE):
1.  **Rol:** Sen, hem uzman bir pedagog hem de kıdemli bir **UI/UX Mühendisisin**.
2.  **Görev:** İçeriği sadece metin olarak değil, **GÖRSEL BİLEŞENLER (WIDGETS)** kullanarak tasarla.
3.  **Görsel Dil:** Bir veri listesi gördüğünde bunu düz yazı yapma; Tablo, Liste veya Grafik kullan.

*** WIDGET KÜTÜPHANESİ (BUNLARI KULLAN) ***
- **table**: Satır ve sütunlardan oluşan veriler için.
- **chart**: Sayısal verileri görselleştirmek için (bar, pie).
- **shape_grid**: Boyama, örüntü veya seçim kutuları için ızgara.
- **key_value**: Tanım ve değer eşleşmeleri için kartlar.
- **code_block**: Kodlama, sıralı adımlar veya algoritma mantığı için.
`;

// --- UNIVERSAL SCHEMA (Rich Component Support) ---
const getUniversalSchema = () => ({
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        instruction: { type: Type.STRING },
        pedagogicalNote: { type: Type.STRING },
        
        // GLOBAL LAYOUT CONFIG
        layoutConfig: {
            type: Type.OBJECT,
            properties: {
                containerType: { type: Type.STRING, enum: ['grid', 'list', 'flex'] },
                gridCols: { type: Type.INTEGER },
                cardStyle: { type: Type.STRING, enum: ['simple', 'border', 'shadow', 'colorful'] },
                accentColor: { type: Type.STRING }
            },
            required: ['containerType', 'gridCols', 'cardStyle']
        },

        // SECTIONS WITH RICH CONTENT
        sections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {type: Type.STRING},
                    layoutConfig: { 
                        type: Type.OBJECT,
                        properties: { gridCols: { type: Type.INTEGER }, containerType: { type: Type.STRING } }
                    },
                    // RICH CONTENT ITEMS
                    content: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                // Common
                                id: {type:Type.STRING},
                                type: { type: Type.STRING, enum: ['text', 'image', 'table', 'chart', 'shape_grid', 'question', 'key_value', 'code_block'] },
                                
                                // Text/Question
                                text: {type:Type.STRING}, 
                                label: {type:Type.STRING}, 
                                value: {type:Type.STRING}, 
                                options: {type:Type.ARRAY, items:{type:Type.STRING}},
                                answer: {type:Type.STRING},

                                // Image
                                imagePrompt: {type:Type.STRING}, 

                                // Table Data
                                headers: {type:Type.ARRAY, items:{type:Type.STRING}},
                                rows: {type:Type.ARRAY, items:{type:Type.ARRAY, items:{type:Type.STRING}}},

                                // Chart/Shape Data
                                chartType: {type:Type.STRING, enum:['bar', 'pie']},
                                dataPoints: {type:Type.ARRAY, items:{type:Type.OBJECT, properties:{label:{type:Type.STRING}, value:{type:Type.NUMBER}}}},
                                
                                // Grid/Shape Data
                                shapeType: {type:Type.STRING},
                                gridConfig: {type:Type.OBJECT, properties:{rows:{type:Type.NUMBER}, cols:{type:Type.NUMBER}}},
                                activeCells: {type:Type.ARRAY, items:{type:Type.NUMBER}}
                            } 
                        } 
                    }
                }
            }
        },
        
        // Legacy Fallback
        items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: {type:Type.STRING} } } },
    },
    required: ['title', 'instruction', 'layoutConfig']
});


export const generateFromRichPrompt = async (activityType: ActivityType, richPrompt: string, options: GeneratorOptions, layoutHint?: any) => {
    
    const itemSchema = getUniversalSchema();
    const schema = {
        type: Type.ARRAY,
        items: itemSchema
    };

    const layoutInstruction = layoutHint ? `
    [MİMARİ TASARIM PLANI]:
    Orijinal analizden gelen şu yapıya sadık kal:
    - Ana Düzen: ${layoutHint.containerType}
    - Sütun: ${layoutHint.gridCols}
    
    Eğer analizde "Tablo" veya "Grid" tespit edildiyse, JSON içindeki 'content' dizisinde mutlaka 'type': 'table' veya 'type': 'shape_grid' kullan. Metin olarak geçiştirme.
    ` : "";

    const finalPrompt = `
    ${PEDAGOGICAL_PROMPT}

    [GÖREV: GÖRSEL KLONLAMA VE İÇERİK ÜRETİMİ]
    Aşağıdaki analiz raporunu kullanarak, orijinaline **YAPISAL OLARAK BİREBİR BENZEYEN** bir etkinlik seti üret.
    
    ${layoutInstruction}

    ANALİZ RAPORU:
    ${richPrompt}
    
    ADET: 1 (Sadece 1 sayfa üret, içeriği dolu olsun).
    SEVİYE: ${options.difficulty}.
    KONU: ${options.topic || 'Genel'}.
    
    ÖNEMLİ KURALLAR:
    - JSON çıktısı yarıda kesilmemelidir. Metinleri KISA tut.
    - "pedagogicalNote" ve "instruction" alanlarını 1-2 cümle ile sınırla.
    - Eğer veri tabloya uygunsa, "type": "table" kullan.
    - Eğer veri grafikse, "type": "chart" kullan.
    - Eğer algoritma veya kod benzeri yapı varsa "type": "code_block" kullan.
    - "imagePrompt" ile görsel betimlemeler ekle (kısa ve net).
    `;

    return generateWithSchema(finalPrompt, schema, 'gemini-2.5-flash', options.useSearch);
};

// ... Legacy exports unchanged ...
export const generateFamilyRelationsFromAI = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => { return [] as any; };
export const generateLogicDeductionFromAI = async (options: GeneratorOptions): Promise<LogicDeductionData[]> => { return [] as any; };
export const generateNumberBoxLogicFromAI = async (options: GeneratorOptions): Promise<NumberBoxLogicData[]> => { return [] as any; };
export const generateMapInstructionFromAI = async (options: GeneratorOptions): Promise<MapInstructionData[]> => { return [] as any; };
export const generateMindGamesFromAI = async (options: GeneratorOptions): Promise<MindGamesData[]> => { return [] as any; };
export const generateMindGames56FromAI = async (options: GeneratorOptions): Promise<MindGames56Data[]> => { return [] as any; };
