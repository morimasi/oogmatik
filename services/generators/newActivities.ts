
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

// ... (Diğer fonksiyonlar aynı kalıyor) ...

/**
 * generateFromRichPrompt: Mimari Klonlama Motoru
 * AI'dan gelen yapısal mimariyi (layoutArchitecture) kullanarak yepyeni veri varyasyonları üretir.
 * [OBJECT OBJECT] ve [BLOK AYRIŞTIRILAMADI] hatalarını önlemek için veri tiplerini zorlar.
 */
export const generateFromRichPrompt = async (activityType: ActivityType, blueprint: string, options: GeneratorOptions): Promise<any> => {
    const { difficulty, topic, studentContext, itemCount } = options;
    
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    GÖREV: Aşağıdaki BLUEPRINT (MİMARİ) yapısını kullanarak yepyeni bir çalışma sayfası üret.
    
    MİMARİ İSKELET:
    ${blueprint}
    
    YENİ İÇERİK KRİTERLERİ:
    - Konu: ${topic || 'Orijinal içerik ile aynı tema'}
    - Zorluk Seviyesi: ${difficulty}
    - Madde Sayısı: ${itemCount || 8}
    
    KRİTİK TALİMATLAR:
    1. Mimariyi KESİNLİKLE KORU. 'layoutArchitecture' içindeki blok yapısını, tiplerini ve sıralamasını bozma.
    2. Sadece içerikleri (text, cells, data) değiştir ve özgünleştir.
    3. Tüm metin alanları 'string' tipinde olmalıdır. Nesne döndürme.
    4. 'dual_column' tipinde 'left' ve 'right' dizilerini mutlaka eşit uzunlukta doldur.
    
    ÇIKTI: 'layoutArchitecture' objesi içeren tam JSON döndür.
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
                                type: { type: Type.STRING, enum: ['header', 'text', 'grid', 'table', 'svg_shape', 'dual_column'] },
                                content: { 
                                    type: Type.OBJECT,
                                    properties: {
                                        text: { type: Type.STRING },
                                        cols: { type: Type.INTEGER },
                                        rows: { type: Type.INTEGER },
                                        cells: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        data: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                                        left: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        right: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        paths: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    }
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

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};
