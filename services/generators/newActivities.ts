
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { 
    GeneratorOptions, 
    FindLetterPairData,
    ActivityType,
    FamilyRelationsData,
    FamilyLogicTestData
} from '../../types';
import { PEDAGOGICAL_BASE, getStudentContextPrompt } from './prompts';

export const generateFamilyRelationsFromAI = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => {
    const { difficulty, itemCount = 8, studentContext } = options;
    
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    GÖREV: "Akrabalık İlişkileri" etkinliği üret.
    ZORLUK: ${difficulty}
    ADET: ${itemCount} adet akrabalık tanımı.
    
    KURALLAR:
    1. İlişkiler hiyerarşik ve mantıklı olmalı.
    2. 'pairs' dizisi içinde 'definition' (örn: Babanın kız kardeşi) ve 'label' (örn: Hala) döndür.
    3. 'momRelatives' ve 'dadRelatives' listelerini bu tanımlardan süzerek ayır.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                pairs: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            definition: { type: Type.STRING },
                            label: { type: Type.STRING },
                            side: { type: Type.STRING, enum: ['mom', 'dad', 'both', 'none'] }
                        },
                        required: ['definition', 'label', 'side']
                    }
                },
                momRelatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                dadRelatives: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'pairs', 'instruction']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateFamilyLogicTestFromAI = async (options: GeneratorOptions): Promise<FamilyLogicTestData[]> => {
    const { difficulty, itemCount = 8, studentContext } = options;
    const prompt = `Akrabalık mantık testi üret. ${itemCount} adet Doğru/Yanlış cümlesi olsun. Zorluk: ${difficulty}. ${PEDAGOGICAL_BASE}`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                statements: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            isTrue: { type: Type.BOOLEAN }
                        },
                        required: ['text', 'isTrue']
                    }
                }
            },
            required: ['title', 'statements']
        }
    };
    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateFindLetterPairFromAI = async (options: GeneratorOptions): Promise<FindLetterPairData[]> => {
    const { difficulty, gridSize = 10, itemCount = 1, targetPair, studentContext } = options;
    const prompt = `${PEDAGOGICAL_BASE} ${getStudentContextPrompt(studentContext)} GÖREV: "Harf İkilisi Dedektifi" etkinliği oluştur. ZORLUK: ${difficulty} IZGARA BOYUTU: ${gridSize}x${gridSize} ADET: ${itemCount} adet bağımsız ızgara. HEDEF İKİLİ: ${targetPair || 'AI Seçsin'} ... (diğer kurallar)`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, grids: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }, targetPair: { type: Type.STRING } }, required: ['grid', 'targetPair'] } } }, required: ['title', 'grids', 'instruction'] } };
    const result = await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
    return result.map((page: any) => ({ ...page, settings: { gridSize, itemCount, difficulty } }));
};

/**
 * generateFromRichPrompt: Mimari Klonlama Motoru
 * AI'dan gelen yapısal mimariyi kullanarak yepyeni veri varyasyonları üretir.
 */
export const generateFromRichPrompt = async (activityType: ActivityType, instructions: string, options: GeneratorOptions): Promise<any> => {
    const { difficulty, itemCount, topic, studentContext } = options;
    
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    GÖREV: Aşağıdaki TEKNİK BLUEPRINT'i kullanarak yepyeni bir eğitim sayfası üret.
    
    BLUEPRINT (MİMARİ):
    ${instructions}
    
    YENİ İÇERİK KRİTERLERİ:
    - Konu: ${topic || 'Orijinal görsel ile aynı konu'}
    - Zorluk: ${difficulty}
    - Sayfa Başı Madde: ${itemCount}
    
    TALİMAT: Mimariyi (tablo yapısı, grid boyutu, dual column düzeni) KESİNLİKLE KORU ama içindeki verileri (sayılar, kelimeler, sorular) tamamen değiştir ve özgünleştir. 
    
    ÇIKTI: 'layoutArchitecture' yapısına sadık kalarak 'blocks' dizisini içeren tam JSON döndür.
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
                    blocks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                content: { type: Type.OBJECT },
                                style: { type: Type.OBJECT }
                            },
                            required: ['type', 'content']
                        }
                    }
                }
            }
        },
        required: ['title', 'instruction', 'layoutArchitecture']
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};
