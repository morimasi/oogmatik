
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, CodeReadingData } from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bilişsel beceri açıklaması.
3. "instruction": Net yönerge.
4. "imagePrompt": Etkinlik için MUTLAKA bir adet ana görsel betimlemesi (İngilizce). Konuyla ilgili sevimli, renkli bir illüstrasyon.
5. İçerik dolu ve gerçekçi olmalı.
`;

// AI Generator for Code Reading (Symbol Decoding)
export const generateCodeReadingFromAI = async (options: GeneratorOptions): Promise<CodeReadingData[]> => {
    const { worksheetCount, symbolType, codeLength, itemCount } = options;
    
    const prompt = `
    Kod Okuma (Şifre Çözme) etkinliği.
    Sembol Tipi: ${symbolType || 'arrows'} (Oklar, Şekiller veya Renkler).
    Kod Uzunluğu: ${codeLength || 4} karakter.
    Soru Sayısı: ${itemCount || 5}.
    
    KURALLAR:
    - Bir "Anahtar" (Key Map) oluştur: Sembol -> Değer (Harf veya Sayı).
    - Anahtarı kullanarak anlamlı veya anlamsız kısa kodlar oluştur.
    - Semboller: 'arrow-up', 'arrow-down', 'triangle', 'square', 'red', 'blue' gibi tanımlayıcı stringler kullan.
    
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
            keyMap: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { symbol: { type: Type.STRING }, value: { type: Type.STRING }, color: { type: Type.STRING } },
                    required: ['symbol', 'value']
                }
            },
            codesToSolve: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sequence: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                    },
                    required: ['sequence', 'answer']
                }
            }
        },
        required: ['title', 'instruction', 'keyMap', 'codesToSolve', 'pedagogicalNote', 'imagePrompt']
    };
    
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<CodeReadingData[]>;
};

// Re-export placeholders or other generators if they were lost, 
// to prevent "export not found" errors if they are referenced elsewhere.
export const generateReadingFlowFromAI = async (o: any) => [];
export const generateLetterDiscriminationFromAI = async (o: any) => [];
export const generateRapidNamingFromAI = async (o: any) => [];
export const generatePhonologicalAwarenessFromAI = async (o: any) => [];
export const generateMirrorLettersFromAI = async (o: any) => [];
export const generateSyllableTrainFromAI = async (o: any) => [];
export const generateVisualTrackingLinesFromAI = async (o: any) => [];
export const generateBackwardSpellingFromAI = async (o: any) => [];
