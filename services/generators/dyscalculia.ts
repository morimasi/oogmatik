
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, MathMemoryCardsData } from '../../types';
import { getMathPrompt } from './prompts';

export const generateMathMemoryCardsFromAI = async (options: GeneratorOptions): Promise<MathMemoryCardsData[]> => {
    const { difficulty, itemCount, variant, selectedOperations, studentContext, visualStyle, showNumbers } = options;
    
    const rule = `
    [GÖREV: MATEMATİK HAFIZA KARTLARI ÜRET]
    ZORLUK: ${difficulty} (Sayı menzili ve işlem karmaşıklığı buna göre belirlensin).
    TOPLAM KART SAYISI: ${itemCount || 16} (Yani ${Math.floor((itemCount || 16)/2)} Çift).
    EŞLEŞTİRME MODU: ${variant} 
    - 'op-res': Sol kart işlem (2+2), Sağ kart sonuç (4).
    - 'vis-num': Sol kart görsel miktar (SVG veya sembol), Sağ kart rakam (4).
    - 'eq-eq': İki farklı işlem ama aynı sonuç (Örn: 2+3 ile 6-1).
    
    KULLANILACAK İŞLEMLER: ${selectedOperations?.join(', ') || 'add'}
    SOMUTLAŞTIRMA STİLİ: ${visualStyle || 'ten-frame'}

    TASARIM KURALLARI:
    1. 'cards' dizisi içinde her çift için AYNI 'pairId' değerini ata.
    2. Kart tiplerini 'operation', 'number', 'visual' veya 'text' olarak belirle.
    3. 'visual' kartlarda 'visualType' mutlaka '${visualStyle}' olsun.
    4. Rakamlar Türk müfredatına ve çocuk seviyesine uygun, tam sayı olsun.
    `;

    const prompt = getMathPrompt("Hafıza Atölyesi: Matematik Kartları", difficulty, rule, studentContext);

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                cards: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            pairId: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['operation', 'number', 'visual', 'text'] },
                            content: { type: Type.STRING },
                            visualType: { type: Type.STRING, nullable: true },
                            numValue: { type: Type.NUMBER }
                        },
                        required: ['id', 'pairId', 'type', 'content', 'numValue']
                    }
                }
            },
            required: ['title', 'instruction', 'cards']
        }
    };

    const result = await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
    return result.map((p: any) => ({
        ...p,
        settings: { gridCols: 4, cardCount: itemCount, difficulty, variant, showNumbers }
    }));
};
// ... diğer generatorlar
