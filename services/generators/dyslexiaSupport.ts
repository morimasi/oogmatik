
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, PseudowordReadingData } from '../../types';
import { getAttentionPrompt, getDyslexiaPrompt } from './prompts';

// ... existing exports ...

export const generatePseudowordReadingFromAI = async (options: GeneratorOptions): Promise<PseudowordReadingData[]> => {
    const { difficulty, itemCount, studentContext, visualMode = 'standard' } = options;
    
    const count = itemCount || 40;
    const diagnosisHint = studentContext?.diagnosis?.join(', ') || 'Okuma Güçlüğü';

    const specifics = `
    GÖREV: Sözde Kelime (Pseudoword) Okuma Seti Üret.
    ZORLUK: ${difficulty}. 
    ADET: ${count} adet kelime.
    TÜR: Kelimeler Türkçe fonotaktik kurallarına uygun ama anlamsız olmalı (örn: "mabret", "zoplun").
    
    PEDAGOJİK KRİTER:
    - ${difficulty === 'Başlangıç' ? 'Açık heceler, basit sesli-sessiz dizilimi (örn: ba, te, mo).' : difficulty === 'Orta' ? 'Kapalı heceler, 2 heceli yapılar (örn: kat-mun, zel-pas).' : 'Karmaşık konson kümeleri, 3+ hece (örn: gürp-lan, stra-top).'}
    - Öğrenci Profili: ${diagnosisHint}. Eğer öğrenci ayna harflerde (b, d, p, q) zorlanıyorsa, bu harfleri içeren kelimelere ağırlık ver.
    `;

    const prompt = getDyslexiaPrompt("Sözde Kelime Okuma Bataryası", difficulty, specifics, studentContext);

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            words: { type: Type.ARRAY, items: { type: Type.STRING } },
            syllableType: { type: Type.STRING }
        },
        required: ['title', 'instruction', 'words', 'pedagogicalNote']
    };

    const result = await generateWithSchema(prompt, schema) as any;
    return [{
        ...result,
        visualMode,
        scoringTable: true,
        difficulty
    }];
};

// ... remaining exports ...
