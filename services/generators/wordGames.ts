
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    WordSearchData, AnagramsData, SpellingCheckData, CrosswordData, CrosswordClue
} from '../../types';

// Helper to define what "Difficulty" means for AI precisely
const getDifficultyPrompt = (diff: string) => {
    switch(diff) {
        case 'Başlangıç': 
            return `KOLAY SEVİYE KURALLARI:
            - Sadece 3-5 harfli, somut ve sık kullanılan kelimeler seç (örn: elma, masa, koş).
            - Cümleler en fazla 5 kelimeden oluşsun.
            - Yanıltıcı veya çeldirici öğe kullanma.
            - Görseller çok net ve basit olsun.`;
        case 'Orta': 
            return `ORTA SEVİYE KURALLARI:
            - 5-8 harfli, günlük hayattan kelimeler seç (örn: sandalye, telefon, yürümek).
            - Ortalama uzunlukta cümleler kur.
            - Birkaç basit çeldirici ekle.`;
        case 'Zor': 
            return `ZOR SEVİYE KURALLARI:
            - 8+ harfli, soyut veya az kullanılan kelimeler seç (örn: sorumluluk, medeniyet).
            - Karmaşık cümle yapıları ve yan anlamlar kullan.
            - Çeldiriciler doğru cevaba çok benzesin (örn: kelime vs kelam).`;
        case 'Uzman': 
            return `UZMAN SEVİYE KURALLARI:
            - Akademik, teknik veya çok uzun kelimeler kullan (örn: muvaffakiyet, fotosentez).
            - Üst düzey mantıksal çıkarım gerektiren ipuçları ver.
            - Maksimum çeldiricilik: görsel ve işitsel olarak neredeyse aynı seçenekler sun.`;
        default: return "";
    }
};

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bilişsel beceri açıklaması.
3. "instruction": Net yönerge.
4. "imagePrompt": Etkinlik için MUTLAKA bir adet ana görsel betimlemesi (İngilizce). Konuyla ilgili sevimli, renkli bir illüstrasyon.
5. İçerik zengin ve eğitici olmalı.
`;

export const generateWordSearchFromAI = async (options: GeneratorOptions): Promise<WordSearchData[]> => {
  const { topic, difficulty, worksheetCount } = options;
  const diffPrompt = getDifficultyPrompt(difficulty);
  const prompt = `
    Konu: ${topic}.
    Etkinlik: Kelime Bulmaca.
    ${diffPrompt}
    Izgara boyutu ve kelime sayısı zorluk seviyesine uygun olsun (Kolay: 8x8/5 kelime, Uzman: 15x15/15 kelime).
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
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      words: { type: Type.ARRAY, items: { type: Type.STRING } },
      hiddenMessage: { type: Type.STRING },
      followUpQuestion: { type: Type.STRING },
      writingPrompt: { type: Type.STRING }
    },
    required: ['title', 'instruction', 'grid', 'words', 'hiddenMessage', 'pedagogicalNote', 'imagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<WordSearchData[]>;
};

export const generateCrosswordFromAI = async (options: GeneratorOptions): Promise<CrosswordData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const diffPrompt = getDifficultyPrompt(difficulty);
    const prompt = `Konu: ${topic}. Etkinlik: Çapraz Bulmaca. ${diffPrompt} ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, theme: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, imagePrompt: {type: Type.STRING}, grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, clues: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id: {type: Type.INTEGER}, direction: {type: Type.STRING}, text: {type: Type.STRING}, start: {type: Type.OBJECT, properties: {row: {type: Type.INTEGER}, col: {type: Type.INTEGER}}, required: ['row','col']}, word: {type: Type.STRING}}, required: ['id','direction','text','start','word']}}, passwordCells: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {row: {type: Type.INTEGER}, col: {type: Type.INTEGER}}, required: ['row','col']}}, passwordLength: {type: Type.INTEGER}, passwordPrompt: {type: Type.STRING} }, required: ['title', 'grid', 'clues', 'passwordPrompt', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<CrosswordData[]>;
}

export const generateAnagramFromAI = async (options: GeneratorOptions): Promise<AnagramsData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const diffPrompt = getDifficultyPrompt(difficulty);
    const prompt = `Konu: ${topic}. Etkinlik: Anagram. ${diffPrompt} ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, imagePrompt: {type: Type.STRING}, anagrams: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {word: {type: Type.STRING}, scrambled: {type: Type.STRING}, imageBase64: {type: Type.STRING}}, required: ['word', 'scrambled']}}, sentencePrompt: {type: Type.STRING} }, required: ['title', 'anagrams', 'sentencePrompt', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<AnagramsData[]>;
};

export const generateSpellingCheckFromAI = async (options: GeneratorOptions): Promise<SpellingCheckData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const diffPrompt = getDifficultyPrompt(difficulty);
    const prompt = `Konu: ${topic}. Etkinlik: Doğru Yazılışı Bul. ${diffPrompt} ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, imagePrompt: {type: Type.STRING}, checks: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {correct: {type: Type.STRING}, options: {type: Type.ARRAY, items: {type: Type.STRING}}, imagePrompt: {type: Type.STRING}}, required: ['correct', 'options']}} }, required: ['title', 'checks', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<SpellingCheckData[]>;
};
