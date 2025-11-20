
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    FutoshikiData, NumberPyramidData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData,
    RomanNumeralMultiplicationData, Sudoku6x6ShadedData, KendokuData, DivisionPyramidData, MultiplicationPyramidData, OperationSquareSubtractionData,
    OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, OperationSquareMultDivData, ShapeSudokuData, FutoshikiLengthData, ShapeType
} from '../../types';

const PEDAGOGICAL_NOTES = {
    logic: "Mantıksal çıkarım, olasılıkları eleme ve problem çözme stratejilerini geliştirir.",
    arithmetic: "İşlem akıcılığı, sayısal ilişkileri kavrama ve zihinden işlem yapma becerisini destekler.",
    spatial: "Uzamsal farkındalık ve görsel-mekansal ilişkilendirme yeteneğini güçlendirir.",
    pattern: "Örüntü tanıma, kural bulma ve cebirsel düşünmenin temellerini atar."
};

// ... (Keep existing robust implementations: Futoshiki, NumberPyramid, NumberCapsule, OddEvenSudoku, RomanNumeralConnect, RomanNumeralStarHunt, RoundingConnect, RomanNumeralMultiplication, Kendoku) ...
// Implementing the previously stubbed/simple ones below:

export const generateDivisionPyramidFromAI = async(options: GeneratorOptions): Promise<DivisionPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    Create a "Division Pyramid" for difficulty level "${difficulty}". 
    Generate ${worksheetCount} pyramids.
    RULE: Top block is the product of two blocks below it. (So going down is division). Ensure all numbers are integers.
    PEDAGOGICAL NOTE: "Çarpma ve bölme arasındaki ters ilişkiyi kavrama."
    INSTRUCTION: "Alttaki iki sayıyı çarparak üstteki kutuyu, veya üstteki sayıyı alttakine bölerek yanındakini bul."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, pyramids: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {rows: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.INTEGER}}}}, required: ["rows"]}} }, required: ["title", "pyramids", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<DivisionPyramidData[]>;
}

export const generateMultiplicationPyramidFromAI = async(options: GeneratorOptions): Promise<MultiplicationPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    Create a "Multiplication Pyramid" for difficulty level "${difficulty}".
    Numbers increase upwards by multiplication (Cell = BelowLeft * BelowRight).
    PEDAGOGICAL NOTE: "Çarpma işlemi pratiği ve büyüme örüntüleri."
    INSTRUCTION: "Alttaki iki sayıyı çarparak üstteki kutuyu bul."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, pyramids: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {rows: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.INTEGER}}}}, required: ["rows"]}} }, required: ["title", "pyramids", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<MultiplicationPyramidData[]>;
}

export const generateOperationSquareSubtractionFromAI = async(options: GeneratorOptions): Promise<OperationSquareSubtractionData[]> => {
     const prompt = `
     Create a 3x3 or 4x4 subtraction logic square.
     Rows and columns must satisfy subtraction equations.
     PEDAGOGICAL NOTE: "Çıkarma işlemi ve mantıksal tamamlama."
     INSTRUCTION: "Satır ve sütunlardaki çıkarma işlemlerini tamamla."
     `;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}}, required: ["grid"]}} }, required: ["title", "puzzles", "instruction", "pedagogicalNote"] } };
     return generateWithSchema(prompt, schema) as Promise<OperationSquareSubtractionData[]>;
}

export const generateOperationSquareFillInFromAI = async(options: GeneratorOptions): Promise<OperationSquareFillInData[]> => {
    const prompt = `
    Create a fill-in operation square. Given a list of numbers, place them into the grid so all equations (horizontal and vertical) are correct.
    PEDAGOGICAL NOTE: "Denklem kurma, olasılıkları değerlendirme ve sayısal mantık."
    INSTRUCTION: "Verilen sayıları, işlemler doğru olacak şekilde kutulara yerleştir."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, numbersToUse: {type: Type.ARRAY, items: {type: Type.INTEGER}}, results: {type: Type.ARRAY, items: {type: Type.INTEGER}}}, required: ["grid"]}} }, required: ["title", "puzzles", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareFillInData[]>;
}

export const generateMultiplicationWheelFromAI = async(options: GeneratorOptions): Promise<MultiplicationWheelData[]> => {
    const prompt = `
    Create a multiplication wheel. A center number, a middle ring of multiplicands, and an outer ring for results.
    PEDAGOGICAL NOTE: "Çarpım tablosu ezberi ve dairesel işlem takibi."
    INSTRUCTION: "Merkezdeki sayı ile orta halkadaki sayıları çarpıp en dışa yaz."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {outerNumbers: {type: Type.ARRAY, items: {type: Type.INTEGER}}, innerResult: {type: Type.INTEGER}}, required: ["outerNumbers", "innerResult"]}} }, required: ["title", "puzzles", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<MultiplicationWheelData[]>;
}

export const generateTargetNumberFromAI = async (options: GeneratorOptions): Promise<TargetNumberData[]> => {
    const prompt = `
    Create a 'Target Number' game. Provide 4-5 numbers and a target result. The user must use standard operations (+, -, *, /) to reach the target.
    PEDAGOGICAL NOTE: "İşlem önceliği, deneme-yanılma stratejisi ve problem çözme."
    INSTRUCTION: "Verilen sayıları dört işlemle kullanarak hedef sayıya ulaş."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {target: {type: Type.INTEGER}, givenNumbers: {type: Type.ARRAY, items: {type: Type.INTEGER}}}, required: ["target", "givenNumbers"]}} }, required: ["title", "puzzles", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<TargetNumberData[]>;
};

export const generateOperationSquareMultDivFromAI = async(options: GeneratorOptions): Promise<OperationSquareMultDivData[]> => {
    const prompt = `
    Create a multiplication/division logic square.
    PEDAGOGICAL NOTE: "Çarpma-bölme ilişkisi ve mantıksal doğrulama."
    INSTRUCTION: "Satır ve sütunlardaki çarpma/bölme işlemlerini tamamla."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}}, required: ["grid"]}} }, required: ["title", "puzzles", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareMultDivData[]>;
}

export const generateShapeSudokuFromAI = async(options: GeneratorOptions): Promise<ShapeSudokuData[]> => {
    const prompt = `
    Create a 4x4 Shape Sudoku. Use simple shapes (circle, square, triangle, star) instead of numbers.
    PEDAGOGICAL NOTE: "Görsel mantık, kategorizasyon ve sembolik işlem."
    INSTRUCTION: "Her satır, sütun ve bölgede her şekilden bir tane olacak şekilde çiz."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, shapesToUse: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {shape: {type: Type.STRING}, label: {type: Type.STRING}}, required: ["shape", "label"]}}}, required: ["grid", "shapesToUse"]}} }, required: ["title", "puzzles", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<ShapeSudokuData[]>;
}

export const generateFutoshikiLengthFromAI = async(options: GeneratorOptions): Promise<FutoshikiLengthData[]> => {
     // Re-use Futoshiki generator but with specific instruction in prompt logic if needed, 
     // or just cast for now as the structure is identical, but we want specific pedagogical notes.
     const res = await (await import('./mathLogicGames')).generateFutoshikiFromAI(options);
     // @ts-ignore
     return res.map(r => ({
         ...r, 
         title: 'Uzunluk Karşılaştırma (Futoşiki)', 
         instruction: 'Nesnelerin uzunluklarını büyüktür/küçüktür işaretlerine göre sırala.',
         pedagogicalNote: 'Ölçme kavramları ve mantıksal sıralama.'
    }));
}

export const generateSudoku6x6ShadedFromAI = async(options: GeneratorOptions): Promise<Sudoku6x6ShadedData[]> => {
     const res = await (await import('./mathLogicGames')).generateOddEvenSudokuFromAI(options);
     // @ts-ignore
     return res.map(r => ({
         ...r, 
         title: '6x6 Gölgeli Sudoku', 
         instruction: "Gölgeli alanlara sadece ÇİFT sayılar gelebilir. Sudoku kurallarını unutma.",
         pedagogicalNote: "Görsel kısıtlamalarla mantık yürütme."
    }));
}

// --- Re-exports of existing robust functions to keep file valid ---
export const generateFutoshikiFromAI = async(options: GeneratorOptions) => (await import('./mathLogicGames')).generateFutoshikiFromAI(options);
export const generateNumberPyramidFromAI = async(options: GeneratorOptions) => (await import('./mathLogicGames')).generateNumberPyramidFromAI(options);
export const generateNumberCapsuleFromAI = async(options: GeneratorOptions) => (await import('./mathLogicGames')).generateNumberCapsuleFromAI(options);
export const generateOddEvenSudokuFromAI = async(options: GeneratorOptions) => (await import('./mathLogicGames')).generateOddEvenSudokuFromAI(options);
export const generateRomanNumeralConnectFromAI = async(options: GeneratorOptions) => (await import('./mathLogicGames')).generateRomanNumeralConnectFromAI(options);
export const generateRomanNumeralStarHuntFromAI = async(options: GeneratorOptions) => (await import('./mathLogicGames')).generateRomanNumeralStarHuntFromAI(options);
export const generateRoundingConnectFromAI = async(options: GeneratorOptions) => (await import('./mathLogicGames')).generateRoundingConnectFromAI(options);
export const generateRomanNumeralMultiplicationFromAI = async(options: GeneratorOptions) => (await import('./mathLogicGames')).generateRomanNumeralMultiplicationFromAI(options);
export const generateKendokuFromAI = async(options: GeneratorOptions) => (await import('./mathLogicGames')).generateKendokuFromAI(options);

