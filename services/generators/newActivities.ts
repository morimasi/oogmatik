
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { 
    GeneratorOptions, 
    FamilyLogicTestData
} from '../../types';
import { PEDAGOGICAL_BASE, getStudentContextPrompt } from './prompts';

export const generateFamilyLogicTestFromAI = async (options: GeneratorOptions): Promise<FamilyLogicTestData[]> => {
    const { difficulty, itemCount, studentContext, variant = 'mixed', familyDepth = 'extended', logicModel = 'indirect' } = options;
    
    const sideText = variant === 'mom' ? 'Anne tarafına' : variant === 'dad' ? 'Baba tarafına' : 'Anne ve baba tarafına dengeli';
    const depthText = familyDepth === 'basic' ? 'Çekirdek aile (1. derece)' : familyDepth === 'extended' ? 'Geniş aile (2. derece)' : 'Karmaşık akrabalıklar (In-laws, vb.)';
    
    // Fix: Using correct logicModel mapping to avoid type overlap warnings on line 15
    const logicText = logicModel === 'identity' ? 'Doğrudan tanımlar' : (logicModel === 'sequence' ? 'Dolaylı çıkarımlar' : 'Karmaşık kıyas ve mantık zincirleri');

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    GÖREV: "Akrabalık Mantık ve Çıkarım Testi" oluştur. 
    ZORLUK: ${difficulty}
    ADET: ${itemCount || 10} ifade.
    ODAK TARAF: ${sideText} odaklan.
    İLİŞKİ DERİNLİĞİ: ${depthText}.
    MANTIKSAL SEVİYE: ${logicText}.
    
    KURALLAR:
    1. İfadeler kesinlikle mantıksal bir akrabalık bağı önermesi içermelidir.
    2. Örn (Simple): "Halam babamın kız kardeşidir." (Doğru)
    3. Örn (Indirect): "Annemin erkek kardeşinin oğlu benim kuzenimdir." (Doğru)
    4. Örn (Syllogism): "Eğer Ayşe annemin kız kardeşi ise, Ayşe benim teyzemdir." (Doğru)
    5. Bazı ifadeler çeldirici olmalı (Yanlış önermeler).
    6. "Bilişsel İpucu" alanını disleksi dostu bir strateji ile doldur.
    
    ÇIKTI FORMATI: Sadece JSON dizi döndür.
    `;

    const schema = {
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
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        isTrue: { type: Type.BOOLEAN },
                        complexity: { type: Type.STRING },
                        hint: { type: Type.STRING }
                    },
                    required: ['text', 'isTrue']
                }
            },
            focusSide: { type: Type.STRING },
            depth: { type: Type.STRING },
            difficulty: { type: Type.STRING }
        },
        required: ['title', 'statements']
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateFamilyRelationsFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    // Keep existing or implement similarly if needed
    return [];
};

export const generateSyllableWordBuilderFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    // Keep existing
    return [];
};

export const generateFromRichPrompt = async (activityType: any, blueprint: string, options: GeneratorOptions) => {
    // Keep existing
    return [];
};
