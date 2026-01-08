
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { 
    GeneratorOptions, 
    FamilyLogicTestData
} from '../../types';
import { PEDAGOGICAL_BASE, getStudentContextPrompt } from './prompts';

export const generateFamilyLogicTestFromAI = async (options: GeneratorOptions): Promise<FamilyLogicTestData[]> => {
    const { difficulty, itemCount, studentContext, variant = 'mixed', familyDepth = 'extended', logicModel = 'indirect' } = options;
    
    const sideText = variant === 'mom' ? 'Sadece Anne tarafı akrabalarına (teyze, dayı, anneanne vb.)' : variant === 'dad' ? 'Sadece Baba tarafı akrabalarına (hala, amca, babaanne vb.)' : 'Anne ve baba tarafına dengeli';
    const depthText = familyDepth === 'basic' ? 'Sadece 1. derece (Anne, baba, kardeş, dede, nene)' : familyDepth === 'extended' ? '2. dereceyi kapsayan (Hala, teyze, kuzen, yeğen vb.)' : 'En karmaşık akrabalıkları (Elti, görümce, bacanak, kayınbirader vb.)';
    const logicText = logicModel === 'simple' ? 'Doğrudan basit tanımlar' : logicModel === 'indirect' ? 'Dolaylı mantıksal çıkarımlar' : 'Karmaşık kıyaslamalar ve "Eğer... ise..." tipi hiyerarşik mantık zincirleri';

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    GÖREV: "Akrabalık Mantık ve Sosyal Muhakeme Testi" oluştur. 
    ZORLUK: ${difficulty}
    ADET: ${itemCount || 10} ifade.
    ODAK: ${sideText} odaklan.
    İLİŞKİ DERİNLİĞİ: ${depthText}.
    MANTIKSAL SEVİYE: ${logicText}.
    
    KURALLAR:
    1. İfadeler kesinlikle mantıksal bir akrabalık bağı önermesi içermelidir.
    2. Örn (Simple): "Babamın annesi benim babaannemdir." (Doğru)
    3. Örn (Indirect): "Annemin kız kardeşinin kızı benim yeğenimdir." (Yanlış - Kuzenimdir).
    4. Örn (Syllogism): "Eğer Ayşe teyzemin kızı ise, Ayşe benim kuzenimdir." (Doğru)
    5. %50 Doğru, %50 Yanlış önerme dağılımı sağla.
    6. Yanlış önermeler disleksi bireylerin sık karıştırdığı hiyerarşik hatalar üzerine kurgulanmalı.
    7. "hint" alanına disleksi dostu bir "Görselleştirme İpucu" yaz.
    
    ÇIKTI FORMATI: Sadece JSON dizi döndür.
    `;

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
                            id: { type: Type.STRING },
                            text: { type: Type.STRING },
                            isTrue: { type: Type.BOOLEAN },
                            complexity: { type: Type.STRING, enum: ['simple', 'indirect', 'syllogism'] },
                            hint: { type: Type.STRING }
                        },
                        required: ['text', 'isTrue', 'complexity']
                    }
                },
                focusSide: { type: Type.STRING },
                depth: { type: Type.STRING },
                difficulty: { type: Type.STRING }
            },
            required: ['title', 'statements', 'focusSide', 'depth']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateFamilyRelationsFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    // Keep existing
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
