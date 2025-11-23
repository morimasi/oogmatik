

import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, RomanNumeralConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, WordConnectData, CoordinateCipherData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeType, ShapeCountingData
} from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Etkinliğin desteklediği bilişsel beceriyi (örn: görsel algı, şekil-zemin ilişkisi) açıkla.
3. "instruction": Öğrenciye yönelik net yönerge.
4. "imagePrompt": Etkinlik için MUTLAKA bir adet ana görsel betimlemesi (İngilizce). Konuyla ilgili sevimli, renkli bir illüstrasyon.
5. İçerik dolu ve gerçekçi olmalı.
`;

const SHAPE_TYPES = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon', 'cube', 'sphere', 'pyramid', 'cone', 'heart', 'cloud', 'moon'];

export const generateFindTheDifferenceFromAI = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Farklı Olanı Bul (Görsel). ${PEDAGOGICAL_PROMPT} ${worksheetCount} sayfa üret.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.STRING } }, correctIndex: { type: Type.INTEGER }, visualDistractionLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] } }, required: ['items', 'correctIndex', 'visualDistractionLevel'] } }
        },
        required: ['title', 'instruction', 'rows', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindTheDifferenceData[]>;
};

export const generateShapeMatchingFromAI = async (options: GeneratorOptions): Promise<ShapeMatchingData[]> => {
  const { difficulty, worksheetCount } = options;
  const prompt = `"${difficulty}" seviyesinde Şekil Eşleştirme. Şekiller: ${SHAPE_TYPES.join(', ')}. ${PEDAGOGICAL_PROMPT}`;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      imagePrompt: { type: Type.STRING }, // Added
      leftColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, shapes: { type: Type.ARRAY, items: { type: Type.STRING } }, color: { type: Type.STRING } }, required: ['id', 'shapes'] } },
      rightColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, shapes: { type: Type.ARRAY, items: { type: Type.STRING } }, color: { type: Type.STRING } }, required: ['id', 'shapes'] } },
      complexity: { type: Type.INTEGER }
    },
    required: ['title', 'instruction', 'leftColumn', 'rightColumn', 'complexity', 'pedagogicalNote', 'imagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<ShapeMatchingData[]>;
};

export const generateFindIdenticalWordFromAI = async (options: GeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Aynısını Bul. Hedef kelime ve çeldiriciler. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            groups: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { words: { type: Type.ARRAY, items: { type: Type.STRING } }, distractors: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['words', 'distractors'] } }
        },
        required: ['title', 'groups', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindIdenticalWordData[]>;
};

export const generateGridDrawingFromAI = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const { gridSize, difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde ${gridSize}x${gridSize} Izgara Çizimi (Pattern Copy). ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            gridDim: { type: Type.INTEGER },
            drawings: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lines: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } } }, complexityLevel: { type: Type.STRING } }, required: ["lines", "complexityLevel"] } }
        },
        required: ["title", "gridDim", "drawings", "instruction", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<GridDrawingData[]>;
};

export const generateSymbolCipherFromAI = async (options: GeneratorOptions): Promise<SymbolCipherData[]> => {
  const { difficulty, worksheetCount } = options;
  const prompt = `"${difficulty}" seviyesinde Şekil Şifresi. Anahtar ve şifreli kelimeler. ${PEDAGOGICAL_PROMPT}`;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      imagePrompt: { type: Type.STRING }, // Added
      cipherKey: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { shape: { type: Type.STRING }, letter: { type: Type.STRING }, color: { type: Type.STRING } }, required: ['shape', 'letter'] } },
      wordsToSolve: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { shapeSequence: { type: Type.ARRAY, items: { type: Type.STRING } }, wordLength: { type: Type.INTEGER }, answer: { type: Type.STRING } }, required: ['shapeSequence', 'wordLength', 'answer'] } }
    },
    required: ['title', 'cipherKey', 'wordsToSolve', 'instruction', 'pedagogicalNote', 'imagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<SymbolCipherData[]>;
};

export const generateBlockPaintingFromAI = async (options: GeneratorOptions): Promise<BlockPaintingData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Blok Boyama. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            grid: { type: Type.OBJECT, properties: { rows: { type: Type.INTEGER }, cols: { type: Type.INTEGER } }, required: ["rows", "cols"]},
            targetPattern: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
            shapes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, color: { type: Type.STRING }, pattern: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }, count: { type: Type.INTEGER } }, required: ["color", "pattern", "count"] } }
        },
        required: ["title", "instruction", "grid", "shapes", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<BlockPaintingData[]>;
};

export const generateVisualOddOneOutFromAI = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Şekillerle Farklı Olanı Bul. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { segments: { type: Type.ARRAY, items: { type: Type.BOOLEAN } } }, required: ["segments"] } }, correctIndex: { type: Type.INTEGER }, reason: { type: Type.STRING } }, required: ["items", "correctIndex", "reason"] } }
        },
        required: ["title", "instruction", "rows", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutData[]>;
};

export const generateSymmetryDrawingFromAI = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const { difficulty, worksheetCount, gridSize } = options;
    const prompt = `"${difficulty}" seviyesinde Simetri Tamamlama. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            gridDim: { type: Type.INTEGER },
            dots: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x: { type: Type.INTEGER }, y: { type: Type.INTEGER }, color: { type: Type.STRING } }, required: ["x", "y"] } },
            axis: { type: Type.STRING, enum: ['vertical', 'horizontal'] },
            isMirrorImage: { type: Type.BOOLEAN }
        },
        required: ["title", "instruction", "gridDim", "dots", "axis", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SymmetryDrawingData[]>;
};

export const generateFindDifferentStringFromAI = async (options: GeneratorOptions): Promise<FindDifferentStringData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Farklı Diziyi Bul. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.STRING } }, correctIndex: { type: Type.INTEGER } }, required: ["items", "correctIndex"] } }
        },
        required: ["title", "instruction", "rows", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindDifferentStringData[]>;
};

export const generateDotPaintingFromAI = async (options: GeneratorOptions): Promise<DotPaintingData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Nokta Boyama (Gizli Resim). ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt1: { type: Type.STRING },
            prompt2: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            svgViewBox: { type: Type.STRING },
            gridPaths: { type: Type.ARRAY, items: { type: Type.STRING } },
            dots: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { cx: { type: Type.NUMBER }, cy: { type: Type.NUMBER }, color: { type: Type.STRING } }, required: ["cx", "cy", "color"] } },
            hiddenImageName: { type: Type.STRING }
        },
        required: ["title", "prompt1", "prompt2", "svgViewBox", "gridPaths", "dots", "hiddenImageName", "instruction", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<DotPaintingData[]>;
};

export const generateAbcConnectFromAI = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const { difficulty, worksheetCount, gridSize } = options;
    const prompt = `"${difficulty}" seviyesinde Nokta Birleştirme (Flow Free). ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, gridDim: { type: Type.INTEGER }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, x: { type: Type.INTEGER }, y: { type: Type.INTEGER }, color: { type: Type.STRING } }, required: ["label", "x", "y"] } } }, required: ["id", "gridDim", "points"] } }
        },
        required: ["title", "instruction", "puzzles", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AbcConnectData[]>;
};

export const generateCoordinateCipherFromAI = async (options: GeneratorOptions): Promise<CoordinateCipherData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Koordinat Şifreleme. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            wordsToFind: { type: Type.ARRAY, items: { type: Type.STRING } },
            cipherCoordinates: { type: Type.ARRAY, items: { type: Type.STRING } },
            decodedMessage: { type: Type.STRING }
        },
        required: ['title', 'instruction', 'grid', 'wordsToFind', 'cipherCoordinates', 'decodedMessage', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<CoordinateCipherData[]>;
};

export const generateWordConnectFromAI = async (options: GeneratorOptions): Promise<WordConnectData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `
    '${topic}' temalı, "${difficulty}" seviyesinde Kelime Bağlama.
    **İngilizce** 'imagePrompt' ekle. Ana görsel için de.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            gridDim: { type: Type.INTEGER },
            points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, pairId: { type: Type.INTEGER }, x: { type: Type.INTEGER }, y: { type: Type.INTEGER }, color: { type: Type.STRING } }, required: ['word', 'pairId', 'x', 'y'] } }
        },
        required: ['title', 'instruction', 'points', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WordConnectData[]>;
};

export const generateProfessionConnectFromAI = async (options: GeneratorOptions): Promise<ProfessionConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Meslek Eşleştirme.
    Meslekler ve araçları için **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
     const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            gridDim: { type: Type.INTEGER },
            points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, imageDescription: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, pairId: { type: Type.INTEGER } }, required: ["label", "imageDescription", "imagePrompt", "x", "y", "pairId"] } }
        },
        required: ["title", "instruction", "points", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ProfessionConnectData[]>;
};

export const generateMatchstickSymmetryFromAI = async (options: GeneratorOptions): Promise<MatchstickSymmetryData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Kibrit Simetrisi. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, axis: { type: Type.STRING, enum: ['vertical', 'horizontal'] }, lines: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { x1: { type: Type.NUMBER }, y1: { type: Type.NUMBER }, x2: { type: Type.NUMBER }, y2: { type: Type.NUMBER }, color: { type: Type.STRING } }, required: ["x1", "y1", "x2", "y2"] } } }, required: ["id", "lines", "axis"] } }
        },
        required: ["title", "instruction", "puzzles", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<MatchstickSymmetryData[]>;
};

export const generateVisualOddOneOutThemedFromAI = async (options: GeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `
    '${topic}' temalı, "${difficulty}" seviyesinde Görsel Farklı Olanı Bul.
    Her öğe için **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
     const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { theme: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, isOdd: { type: Type.BOOLEAN } }, required: ["description", "imagePrompt", "isOdd"] } } }, required: ["theme", "items"] } }
        },
        required: ["title", "instruction", "rows", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutThemedData[]>;
};

export const generatePunctuationColoringFromAI = async (options: GeneratorOptions): Promise<PunctuationColoringData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Noktalama Boyama. ${PEDAGOGICAL_PROMPT}`;
     const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            sentences: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, color: { type: Type.STRING }, correctMark: { type: Type.STRING } }, required: ["text", "color", "correctMark"] } }
        },
        required: ["title", "instruction", "sentences", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<PunctuationColoringData[]>;
};

export const generateSynonymAntonymColoringFromAI = async (options: GeneratorOptions): Promise<SynonymAntonymColoringData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Eş/Zıt Anlam Boyama. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            colorKey: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, color: { type: Type.STRING } }, required: ["text", "color"] } },
            wordsOnImage: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["word", "x", "y"] } }
        },
        required: ["title", "instruction", "colorKey", "wordsOnImage", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SynonymAntonymColoringData[]>;
};

export const generateStarHuntFromAI = async (options: GeneratorOptions): Promise<StarHuntData[]> => {
    const { difficulty, worksheetCount, gridSize } = options;
    const prompt = `"${difficulty}" seviyesinde Yıldız Avı. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            targetCount: { type: Type.INTEGER }
        },
        required: ["title", "instruction", "grid", "targetCount", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<StarHuntData[]>;
};
