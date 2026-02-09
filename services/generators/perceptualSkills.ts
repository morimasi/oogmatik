
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, CoordinateCipherData, WordConnectData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeType, ShapeCountingData, MapInstructionData
} from '../../types';
import { ocrService } from '../ocrService';
import { MAP_DETECTIVE_PROMPT, PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts';

export const generateVisualOddOneOutFromAI = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { difficulty, worksheetCount, visualType, distractionLevel, gridSize, studentContext } = options;
    
    const typeDesc = visualType === 'geometric' ? 'Karmaşık Geometrik Şekiller' : 
                   visualType === 'abstract' ? 'Soyut Desenler' : 
                   visualType === 'character' ? 'Ayna Harf ve Rakamlar (b/d, p/q, 6/9 vb.)' : 'Karmaşık poligonlar';

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    GÖREV: [TANISAL GÖRSEL AYRIŞTIRMA (ODD-ONE-OUT)]
    
    PARAMETRELER:
    - Mimari Tip: ${typeDesc}.
    - Zorluk: ${difficulty}.
    - Çeldirici Hassasiyeti: ${distractionLevel}.
    - Satır Başı Öğe Sayısı: ${gridSize || 4}.
    - Öğrenci Profili: ${studentContext?.diagnosis?.join(', ') || 'Genel Gelişim'}.
    
    STRATEJİ:
    Öğrencinin disleksi/dikkat profiline göre hataları hedefle. 
    Örneğin; görsel ters algılama (reversal) varsa, şekilleri X ekseninde aynalayarak çeldirici oluştur.
    
    ÇIKTI FORMATI:
    - rows: [{ items: [{ svgPaths: [...], label: string, rotation: number, isMirrored: boolean }], correctIndex: number, targetedErrors: ["visual_reversal", ...], cognitiveGoal: "..." }]
    `;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            cognitiveGoal: { type: Type.STRING },
            targetedErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
            rows: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: { 
                        items: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    svgPaths: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { d: {type:Type.STRING}, fill: {type:Type.STRING}, stroke: {type:Type.STRING} } } },
                                    label: { type: Type.STRING },
                                    rotation: { type: Type.NUMBER },
                                    isMirrored: { type: Type.BOOLEAN }
                                } 
                            } 
                        }, 
                        correctIndex: { type: Type.INTEGER }, 
                        reason: { type: Type.STRING }
                    }
                } 
            }
        },
        required: ["title", "instruction", "rows", "pedagogicalNote", "targetedErrors"]
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as Promise<VisualOddOneOutData[]>;
};

// ... remaining perceptual generators ...
