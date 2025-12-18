
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import { StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData, ProverbFillData, ProverbSayingSortData, ProverbWordChainData, ProverbSentenceFinderData, ProverbSearchData } from '../../types';

const PEDAGOGICAL_PROMPT = `
[ROL: UZMAN EĞİTİM MATERYALİ TASARIMCISI]
Hedef Kitle: İlkokul öğrencileri (özellikle Disleksi ve DEHB desteği gerektirenler).
Amaç: Okuduğunu anlama, kelime dağarcığını geliştirme ve yaratıcı düşünmeyi desteklemek.
Tasarım Felsefesi: Metin tek başına yetersizdir. Sayfayı dolduracak etkileşimli görevler (kelime avı, çizim, sorular) olmalıdır.
`;

export const generateStoryComprehensionFromAI = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    
    // Zorluk seviyesine göre metin uzunluğu ve karmaşıklığı
    const constraints = difficulty === 'Başlangıç' 
        ? '50-80 kelime. Basit cümleler. Somut olaylar.' 
        : difficulty === 'Orta' 
            ? '100-150 kelime. Diyalog içerebilir. Günlük maceralar.' 
            : '200+ kelime. Betimlemeler, sebep-sonuç ilişkileri.';
    
    const prompt = `
    "${topic}" konusunda, ${difficulty} seviyesinde (${constraints}) özgün bir hikaye yaz.
    
    EKSTRA GÖREVLER (JSON ÇIKTISINDA ZORUNLU):
    1. **vocabulary:** Hikayeden ${difficulty === 'Başlangıç' ? '3' : '4'} adet "öğrenilmesi gereken" veya "zor" kelime seç ve kısa, çocuk dostu tanımlarını yaz.
    2. **creativeTask:** Öğrencinin hikayeyle ilgili yapabileceği bir çizim veya kısa yazma görevi ver (Örn: "Hikayenin sonunu değiştirerek resmini çiz" veya "Kahramana yeni bir isim bul ve nedenini yaz").
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
                        answer: { type: Type.STRING }, // Correct answer text
                        isTrue: { type: Type.BOOLEAN, nullable: true }
                    },
                    required: ['type', 'question', 'answer']
                }
            }
        },
        required: ['title', 'story', 'imagePrompt', 'mainIdea', 'characters', 'setting', 'questions', 'pedagogicalNote', 'vocabulary', 'creativeTask']
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    
    // Using a more capable model for story generation logic
    return generateWithSchema(prompt, schema, 'gemini-2.5-flash') as Promise<StoryData[]>;
};

// ... Diğer fonksiyonlar (StoryAnalysis, vb.) için basit placeholderlar veya mevcut kodlar kalabilir.
export const generateStoryAnalysisFromAI = async (o: GeneratorOptions) => [] as any; 
export const generateStoryCreationPromptFromAI = async (o: GeneratorOptions) => [] as any;
export const generateWordsInStoryFromAI = async (o: GeneratorOptions) => [] as any;
export const generateStorySequencingFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbSayingSortFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbWordChainFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbFillInTheBlankFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbSearchFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbSentenceFinderFromAI = async (o: GeneratorOptions) => [] as any;
