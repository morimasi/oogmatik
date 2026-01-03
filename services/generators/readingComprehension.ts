
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, StoryData, ReadingStroopData } from '../../types';

const PEDAGOGICAL_PROMPT = `
[ROL: KIDEMLİ ÖZEL EĞİTİM UZMANI & PSİKOMETRİST]
Amaç: Disleksik çocuklarda dürtü kontrolü, odaklanma ve sözel enterferans (karışma) direncini artırmak.
Tasarım: Sözel Stroop Testi (Verbal Stroop) bir A4 sayfasını dolduracak yoğunlukta olmalıdır.
`;

export const generateReadingStroopFromAI = async (options: GeneratorOptions): Promise<ReadingStroopData[]> => {
    const { difficulty, worksheetCount, itemCount = 40, variant } = options;
    
    const wordTypeMap: Record<string, string> = {
        'colors': 'Temel Renk Adları (Mavi, Kırmızı, Yeşil vb.)',
        'semantic': 'Renk çağrıştıran doğa nesneleri (Limon, Deniz, Çilek, Gece vb.)',
        'confusing': 'Birbirine benzeyen çeldirici kelimeler (Mavi-Mani, Sarı-Sarı, Kara-Kasa vb.)',
        'shapes': 'Geometrik Şekil İsimleri (Kare, Üçgen, Daire, Yıldız vb.)',
        'animals': 'Hayvan İsimleri (Aslan, Kedi, Köpek, Fil vb.)',
        'verbs': 'Kısa Emir Fiilleri (Bak, Gör, Koş, Dur, Al vb.)',
        'mirror_chars': 'Ayna harflerle başlayan kelimeler (Balık, Dalga, Polat, Oluk vb. - b,d,p,q odaklı)'
    };

    const selectedWordType = wordTypeMap[variant || 'colors'];

    const prompt = `
    "${difficulty}" seviyesinde Sözel Stroop Testi üret.
    Kelimeler: ${selectedWordType} olsun.
    Adet: Sayfa başına ${itemCount} kelime.
    
    KURALLAR:
    1. Kelime ile yazıldığı renk ÇELİŞMELİDİR (Örn: "Limon" kelimesi Mavi renkle yazılmalı).
    2. Kelime ve Renk kombinasyonlarını rastgele ve dengeli dağıt.
    3. Disleksi dostu font ve yerleşim planla.
    4. Renk kodlarını (hex veya css name) çeşitlendir.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet sayfa üret.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                grid: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            color: { type: Type.STRING }
                        },
                        required: ['text', 'color']
                    }
                }
            },
            required: ['title', 'grid', 'instruction']
        }
    };

    const result = await generateWithSchema(prompt, schema) as any[];
    return result.map(p => ({
        ...p,
        settings: {
            cols: options.gridSize || 4,
            fontSize: difficulty === 'Başlangıç' ? 28 : (difficulty === 'Orta' ? 22 : 18),
            wordType: options.variant || 'colors'
        },
        evaluationBox: true
    }));
};

export const generateStoryComprehensionFromAI = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    
    const constraints = difficulty === 'Başlangıç' 
        ? '50-80 kelime. Basit cümleler. Somut olaylar.' 
        : difficulty === 'Orta' 
            ? '100-150 kelime. Diyalog içerebilir. Günlük maceralar.' 
            : '200+ kelime. Betimlemeler, sebep-sonuç ilişkileri.';
    
    const prompt = `
    "${topic}" konusunda, ${difficulty} seviyesinde (${constraints}) özgün bir hikaye yaz.
    
    EKSTRA GÖREVLER (JSON ÇIKTISINDA ZORUNLU):
    1. **vocabulary:** Hikayeden ${difficulty === 'Başlangıç' ? '3' : '4'} adet "öğrenilmesi gereken" veya "zor" kelime seç ve kısa, child-friendly tanımlarını yaz.
    2. **creativeTask:** Öğrencinin hikayeyle ilgili yapabileceği bir çizim veya kısa yazma görevi ver.
    3. **questions:** 
       - 2 adet Çoktan Seçmeli (4 şıklı).
       - 1 adet Doğru/Yanlış.
       - 1 adet Açık Uçlu (Yorum/Çıkarım).
    
    GÖRSEL PROMPT: Hikayenin en can alıcı sahnesini betimleyen, çocuklar için uygun, renkli, "storybook illustration" tarzında İngilizce bir prompt yaz.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            story: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            mainIdea: { type: Type.STRING },
            characters: { type: Type.ARRAY, items: { type: Type.STRING } },
            setting: { type: Type.STRING },
            vocabulary: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        definition: { type: Type.STRING }
                    },
                    required: ['word', 'definition']
                }
            },
            creativeTask: { type: Type.STRING },
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['multiple-choice', 'true-false', 'open-ended'] },
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
                        answer: { type: Type.STRING },
                        isTrue: { type: Type.BOOLEAN, nullable: true }
                    },
                    required: ['type', 'question', 'answer']
                }
            }
        },
        required: ['title', 'story', 'imagePrompt', 'mainIdea', 'characters', 'setting', 'questions', 'pedagogicalNote', 'vocabulary', 'creativeTask']
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    
    return generateWithSchema(prompt, schema) as Promise<StoryData[]>;
};

export const generateStoryAnalysisFromAI = async (o: GeneratorOptions) => [] as any; 
export const generateStoryCreationPromptFromAI = async (o: GeneratorOptions) => [] as any;
export const generateWordsInStoryFromAI = async (o: GeneratorOptions) => [] as any;
export const generateStorySequencingFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbSayingSortFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbWordChainFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbFillInTheBlankFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbSearchFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbSentenceFinderFromAI = async (o: GeneratorOptions) => [] as any;
