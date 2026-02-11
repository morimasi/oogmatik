
import { Type } from "@google/genai";
import { generateCreativeMultimodal, generateWithSchema, MultimodalFile } from '../geminiClient';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts';

/**
 * generateCreativeStudioActivity: 
 * Bu motor, AI'ya sadece metin değil, bir "sayfa mimarisi" kurmasını emreder.
 */
export const generateCreativeStudioActivity = async (enrichedPrompt: string, options: any, files?: MultimodalFile[]) => {
    
    const visualFrameworkDirectives = `
    [MİMARİ YETENEK SETİ - ZORUNLU KURAL]
    Senin çıktın bir "layoutArchitecture" içermelidir. Aşağıdaki bileşenleri (blocks) kullanarak sayfayı görselleştir:
    
    1. 'grid': Harf/Sayı tabloları, sudoku benzeri yapılar için. 'cells' dizisi ve 'cols' sayısı içerir.
    2. 'table': Başlıklı (headers) ve satırlı (data) profesyonel veri tabloları için.
    3. 'svg_shape': Geometrik sorular, simetri, örüntü veya ikonlar için. Mutlaka 'paths' dizisi (SVG d string) ve 'viewBox="0 0 100 100"' kullan.
    4. 'dual_column': Karşılıklı eşleştirme (Matching) görevleri için 'left' ve 'right' dizileri içerir.
    5. 'image': 'prompt' alanı üzerinden görsel içerik üretmek için.
    6. 'text': Standart yönerge veya hikaye blokları için.
    
    [GÖRSEL ANALİZ TALİMATI]
    Eğer kullanıcı bir görsel yüklediyse; o görseldeki tabloları 'table' bloğuna, ızgaraları 'grid' bloğuna, şekilleri 'svg_shape' bloğuna birebir AKTAR.
    `;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${visualFrameworkDirectives}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    [GÖREV]
    Kullanıcı İstemi: "${enrichedPrompt}"
    Zorluk Seviyesi: ${options.difficulty}
    Öğe Sayısı: ${options.itemCount}
    Çeldirici Seviyesi: ${options.distractionLevel}
    
    ÖNEMLİ: Çıktıda 'layoutArchitecture.blocks' dizisi zengin bileşenlerle dolu olmalı. Sadece metinden oluşan bir sayfa RET sebebidir.
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
                                type: { type: Type.STRING, enum: ['header', 'text', 'grid', 'table', 'svg_shape', 'dual_column', 'image', 'question'] },
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
                                        prompt: { type: Type.STRING },
                                        viewBox: { type: Type.STRING },
                                        paths: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    }
                                },
                                style: {
                                    type: Type.OBJECT,
                                    properties: {
                                        fontSize: { type: Type.INTEGER },
                                        fontWeight: { type: Type.STRING },
                                        textAlign: { type: Type.STRING },
                                        backgroundColor: { type: Type.STRING },
                                        borderRadius: { type: Type.INTEGER }
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

    return await generateCreativeMultimodal({ prompt, schema, files });
};

export const refinePromptWithAI = async (prompt: string, mode: 'expand' | 'narrow' | 'clinical'): Promise<string> => {
    const aiPrompt = `[GÖREV: PROMPT MİMARI] Bu istemi, görsel bileşenler (tablo, grid, svg) ve klinik yönergeler içerecek şekilde ${mode === 'expand' ? 'zenginleştir' : 'odakla'}: "${prompt}"`;
    const result = await generateWithSchema(aiPrompt, { type: Type.OBJECT, properties: { refined: { type: Type.STRING } }, required: ['refined'] });
    return result.refined;
};

export const analyzeReferenceFiles = async (files: MultimodalFile[], currentPrompt: string): Promise<string> => {
    const prompt = `Ekteki materyalin teknik layout yapısını analiz et ve Bursa Disleksi AI'nın bunu 'grid', 'table' ve 'svg_shape' bloklarıyla klonlaması için teknik bir blueprint promptu yaz.`;
    const result = await generateCreativeMultimodal({ prompt, schema: { type: Type.OBJECT, properties: { analysis: { type: Type.STRING } }, required: ['analysis'] }, files });
    return result.analysis;
};
