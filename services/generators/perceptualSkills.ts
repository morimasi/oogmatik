
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    FindTheDifferenceData, ShapeMatchingData, GridDrawingData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, AbcConnectData, ShapeCountingData
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
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Farklı Olanı Bul (Görsel). ${PEDAGOGICAL_PROMPT} ${worksheetCount} sayfa üret.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
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
      imagePrompt: { type: Type.STRING },
      leftColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, shapes: { type: Type.ARRAY, items: { type: Type.STRING } }, color: { type: Type.STRING } }, required: ['id', 'shapes'] } },
      rightColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, shapes: { type: Type.ARRAY, items: { type: Type.STRING } }, color: { type: Type.STRING } }, required: ['id', 'shapes'] } },
      complexity: { type: Type.INTEGER }
    },
    required: ['title', 'instruction', 'leftColumn', 'rightColumn', 'complexity', 'pedagogicalNote', 'imagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<ShapeMatchingData[]>;
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
            imagePrompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            drawings: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lines: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } } }, complexityLevel: { type: Type.STRING } }, required: ["lines", "complexityLevel"] } }
        },
        required: ["title", "gridDim", "drawings", "instruction", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<GridDrawingData[]>;
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
            imagePrompt: { type: Type.STRING },
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
            imagePrompt: { type: Type.STRING },
            rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { segments: { type: Type.ARRAY, items: { type: Type.BOOLEAN } } }, required: ["segments"] } }, correctIndex: { type: Type.INTEGER }, reason: { type: Type.STRING } }, required: ["items", "correctIndex", "reason"] } }
        },
        required: ["title", "instruction", "rows", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutData[]>;
};

export const generateSymmetryDrawingFromAI = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Simetri Tamamlama. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
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

export const generateAbcConnectFromAI = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Nokta Birleştirme (Flow Free). ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, gridDim: { type: Type.INTEGER }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, x: { type: Type.INTEGER }, y: { type: Type.INTEGER }, color: { type: Type.STRING } }, required: ["label", "x", "y"] } } }, required: ["id", "gridDim", "points"] } }
        },
        required: ["title", "instruction", "puzzles", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AbcConnectData[]>;
};

export const generateShapeCountingFromAI = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde "Şekil Sayma" (Örn: Kaç üçgen var?).
    Karmaşık, iç içe geçmiş şekillerden oluşan SVG path verileri üret.
    SVG pathleri 'd' attribute olarak ve renkleri 'fill' olarak ver.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            figures: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        svgPaths: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    d: { type: Type.STRING },
                                    fill: { type: Type.STRING }
                                },
                                required: ["d", "fill"]
                            }
                        },
                        targetShape: { type: Type.STRING },
                        correctCount: { type: Type.INTEGER }
                    },
                    required: ["svgPaths", "targetShape", "correctCount"]
                }
            }
        },
        required: ["title", "instruction", "figures", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ShapeCountingData[]>;
};
